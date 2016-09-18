import {ReactiveVar} from "meteor/reactive-var";
import YouTubePlayer from "youtube-player";

const time = new ReactiveVar(0);

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
};

Template.home.onCreated(function () {
    Meteor.subscribe("posts.all");

    Meteor.setInterval(() => {
        time.set(Date.now());
    }, 100)
})

let player;

Template.home.onRendered(function () {
    player = YouTubePlayer('video-player');

    player.loadVideoById("LdH1hSWGFGU");
    player.pauseVideo();
});

Template.home.events({
    'click .video-trigger'(event) {
        event.preventDefault();

        if (player)
            player.loadVideoById(youtube_parser($(event.currentTarget).attr('href')));
    },
    'click .open-messages'(event) {
        event.preventDefault();
        console.log($(event.currentTarget).attr('href'));
    }
})

Template.home.helpers({
    'posts'() {
        return Posts.find({}, {sort: {timestamp: -1}}).fetch();
    },
    'stockImage'(postUrl) {
        return `http://img.youtube.com/vi/${youtube_parser(postUrl)}/0.jpg`;
    },
    'watchers'(watchers) {
        return watchers.slice(0, 2).join(", ") + (watchers.length > 2 ? `, and ${watchers.length - 2} other(s)` : "");
    },
    'timestamp'(timestamp) {
        return moment(timestamp).from(time.get()) === "in a few seconds" ? "just now" : moment(timestamp).from(time.get());
    },
    'reactions'(post) {
        let reactions = post.emotions;
        let aggregation = {};
        _.each(reactions, (data) => {
            _.each(Object.keys(data.emotions), (type) => {
                if (type != "contempt" && type != "engagement") {
                    if (!(type in aggregation)) aggregation[type] = 0;
                    aggregation[type] += data.emotions[type];
                }
            });
        })

        _.each(Object.keys(aggregation), (type) => {
            aggregation[type] /= reactions.length;
            aggregation[type] = +aggregation[type].toFixed(2);
        })

        let maxValue = 0;
        _.each(Object.keys(aggregation), (type) => {
            if (aggregation[type] > maxValue) {
                maxValue = aggregation[type];
            }
        });

        let formattedValues = [];

        _.each(Object.keys(aggregation), (type) => {
            formattedValues.push({emoticon: type, value: Math.round(aggregation[type] / maxValue * 100)});
        });

        return formattedValues;
    }
})