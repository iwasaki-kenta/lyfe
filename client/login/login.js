import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';

import "sweetalert";
import "sweetalert/dist/sweetalert.css";

import './login.html';

Template.login.events({
    'click #login': (e) => {
        e.stopPropagation();

        let username = $("#username").val();
        let pass = $("#password").val();

        Meteor.loginWithPassword(username, pass, (err) => {
            if (!err) {
                FlowRouter.go("/");
            } else {
                swal("Oops...", err.reason, "error");
            }
        })
    }
});

Template.login.helpers({
})

Template.login.onRendered(() => {

})

Template.logout.onCreated(() => {
    Meteor.logout(function() {
        FlowRouter.go("/login");
    });
})