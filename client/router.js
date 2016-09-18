let root = FlowRouter.group({
    triggersEnter: [(context, redirect) => {
        if (Meteor.userId()) redirect('/');
    }]
})

let authenticated = FlowRouter.group({
    triggersEnter: [(context, redirect) => {
        if (!Meteor.userId()) redirect('/login');
    }]
})

root.route("/login", {
    action: () => {
        BlazeLayout.render("mainLayout", {content: "login"});
    }
})

root.route("/register", {
    action: () => {
        BlazeLayout.render("mainLayout", {content: "register"});
    }
})

authenticated.route("/", {
    action: () => {
        BlazeLayout.render("mainLayout", {content: "home"});
    }
});


authenticated.route("/chrome", {
    action: () => {
        BlazeLayout.render("mainLayout", {content: "chrome"});
    }
})

authenticated.route("/logout", {
    action: () => {
        BlazeLayout.render("mainLayout", {content: "logout"});
    }
})