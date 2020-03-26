import React, { Component } from "react";
import AdminLayout from "../../../black-dashboard-react/layouts/Admin/Admin.js";
import { render } from "react-dom";

var base64 = require("base-64");

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loaded: false,
            placeholder: "Loading"
        };
    }

    componentDidMount() {
        fetch("/machines")
            .then(response => {
                if (response.status > 400) {
                    return this.setState(() => {
                        return { placeholder: "Something went wrong!" };
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                this.setState(() => {
                    return {
                        data,
                        loaded: true
                    };
                });
            });
    }

    render() {
        return (
            <AdminLayout />
        );
    }
}

export default App;

const container = document.getElementById("app");
render(<App />, container);