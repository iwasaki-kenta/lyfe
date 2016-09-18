Meteor.publish("posts.all", () => {
    return Posts.find({}, {sort: {timestamp: -1}});
})