import {ReactiveVar} from "meteor/reactive-var";
import YouTubePlayer from "youtube-player";

let emojis = new ReactiveVar();
let playing = true;

Template.chrome.helpers({
    'emoji'() {
        return emojis.get() ? emojis.get().dominantEmoji : "";
    }
})

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
};

Template.chrome.events({
    'click #searchYoutube'(e) {
        var id = youtube_parser($('#youtubeUrl').val());
        player.loadVideoById(id);
    }
})

let emotionChart;
let lastUpdate = Date.now();

let videoName, videoUrl;
let subHandle;

Template.chrome.onCreated(function() {
    subHandle = Meteor.subscribe("posts.all");
})

Template.chrome.onRendered(function () {
    player = YouTubePlayer('video-player');
    player.loadVideoById('LdH1hSWGFGU');

    player.on('stateChange', (event) => {
        if (event.data == YT.PlayerState.PLAYING) {
            Promise.all([player.getVideoUrl(), player.getVideoData()]).then((result) => {
                videoUrl = result[0];
                videoName = result[1].title;
            });
            playing = true;
        }
        else if (event.data == YT.PlayerState.PAUSED) {
            videoName = null;
            videoUrl = null;
            playing = false;
        }
    });

    player.pauseVideo();

    nv.addGraph(() => {
        let data = [{
            key: "Emotion Ratio",
            values: []
        }];

        emotionChart = nv.models.discreteBarChart()
            .x((d) => d.label)
            .y((d) => d.value)
            .staggerLabels(true);

        d3.select("#chart").datum(data).call(emotionChart);

        nv.utils.windowResize(chart.update);
        return emotionChart;
    })


    const divRoot = $("#affdex_elements")[0];
    const width = 320;
    const height = 240;
    const faceMode = affdex.FaceDetectorMode.LARGE_FACES;

    const detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

    detector.detectAllEmotions();
    detector.detectAllEmojis();
    detector.detectAllAppearance();

    detector.addEventListener("onInitializeSuccess", function () {
        console.log("Successfully initialized.");
    });

    detector.addEventListener("onInitializeFailure", function () {
        console.log("Failed.");
    });

    detector.addEventListener("onWebcamConnectSuccess", function () {
        console.log('#logs', "Webcam access allowed");
    });

    detector.addEventListener("onWebcamConnectFailure", function () {
        console.log("Webcam access denied");
    });

    detector.addEventListener("onImageResultsSuccess", function (faces, image, timestamp) {
        const data = [{
            key: "Emotion Ratio",
            values: []
        }];

        if (playing && subHandle.ready() && faces.length > 0) {
            let reactions = {};

            _.each(Object.keys(faces[0].emotions), (emotion) => {
                if (emotion != "valence") {
                    data[0].values.push({label: emotion, value: faces[0].emotions[emotion]});
                    reactions[emotion] = faces[0].emotions[emotion];
                }
            })

            d3.select("#chart").datum(data).call(emotionChart);

            if (videoName && videoUrl) {
                let post = Posts.findOne({name: videoName, url: videoUrl, type: "video"})

                if (post) {
                    if (post.watchers && !_.contains(post.watchers, Meteor.user().username)) {
                        post.watchers.push(Meteor.user().username);
                    }

                    Posts.update(post._id, {
                        $set: {
                            watchers: post.watchers,
                            timestamp: Date.now(),
                        },
                        $push: {
                            emotions: {watcher: Meteor.user().username, timestamp: Date.now(), emotions: reactions}
                        }
                    })
                } else {
                    Posts.insert({
                        name: videoName,
                        url: videoUrl,
                        type: "video",
                        watchers: [Meteor.user().username],
                        emotions: [{watcher: Meteor.user().username, timestamp: Date.now(), emotions: reactions}],
                        timestamp: Date.now()
                    })
                }
            }
        }
    });

    if (detector && !detector.isRunning) {
        detector.start();
    }
});