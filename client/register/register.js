import {Template} from "meteor/templating";
import "sweetalert";
import "sweetalert/dist/sweetalert.css";
import "./register.html";

Template.register.events({
    'click #register': () => {
        let username = $("#username").val();
        let pass = $("#password").val();

        if (pass === $("#password-confirm").val()) {
            Accounts.createUser({username, password: pass}, (err) => {
                if (!err) {
                    FlowRouter.go("/");
                } else {
                    swal("Oops...", err.reason, "error");
                }
            });
        } else {
            swal("Oops...", "Please double-check that you have entered your info correctly.", "error");
        }
    },
});

Template.register.helpers({})

Template.register.onRendered(() => {

})