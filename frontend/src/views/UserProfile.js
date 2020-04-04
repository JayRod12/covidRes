/*!

=========================================================
* Black Dashboard React v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/black-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
// react plugin for creating notifications over the dashboard
import NotificationAlert from "react-notification-alert";

// reactstrap components
import {
  Alert,
  UncontrolledAlert,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardText,
  CardTitle,
  FormGroup,
  Form,
  Label,
  Input,
  Row,
  Col
} from "reactstrap";

import AssignmentTaskWindow from "views/AssignmentTaskWindow.js"

import $ from 'jquery';

const IS_DEV = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = $.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      data_roles: [],
      loaded: false,
      placeholder: "Loading",
      error_message: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    fetch('/rest/users/'+this.state.data.pk+"/", {
      method: 'PATCH',
      body: JSON.stringify({
          username: data.get('username'),
          role: data.get('role'),
          email: data.get('email'),
          first_name: data.get('first_name'),
          last_name: data.get('last_name')
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {console.log(response)});
  }
  componentDidMount() {
    const { pk } = this.props.match.params
    fetch('/rest/users/'+pk+'/')
            .then(response => {
                if (response.status > 400) {
                  throw new Error(response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                this.setState(() => {
                    return {
                        data: data,
                        loaded: true
                    };
                });
            })
            .catch(error => {
              this.setState(() => {
                return {
                  loaded: true,
                  placeholder: "Failed to load",
                  error_message: error,
                };
              });
            });
    fetch('/rest/roles/')
            .then(response => {
                if (response.status > 400) {
                  throw new Error(response.status);
                }
                return response.json();
            })
            .then(data => {
                const data_roles = IS_DEV ? data.results : data
                console.log("HERE ROLES:", data_roles);
                this.setState({data_roles: data_roles});
                console.log("HERE ROLES:", this.state.data_roles);
            })
            .catch(error => {
              console.log(error)
            });
  };
  render() {
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">Loading user...</CardTitle>
        </CardHeader>
      );
    }
    let user;
    if (this.state.error_message.length > 0) {
      user = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data.pk) {
      user = (
        <Col md="8">
          <Card>
            <CardHeader>
              <h5 className="title">Machine Profile</h5>
            </CardHeader>
            <CardBody>
              <Form onSubmit={this.handleSubmit}>
                <Row>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>ID</label>
                      <Input
                        defaultValue={this.state.data.pk}
                        disabled
                        placeholder="ID"
                        name="pk"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="3">
                    <FormGroup>
                      <label>Username</label>
                      <Input
                        defaultValue={this.state.data.username}
                        placeholder="Username"
                        name="username"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>Role</label>
                      <Input
                        defaultValue={this.state.data.role}
                        name="role"
                        type="select"
                      >
                      <option key={0} value={null}></option>
                      {this.state.data_roles.length > 0 && this.state.data_roles.map((item, ii) => {return(
                        <option key={ii+1} value={item.id}>{item.name}</option>
                      )})}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="5">
                    <FormGroup>
                      <label>Email</label>
                      <Input
                        defaultValue={this.state.data.email}
                        placeholder="Email"
                        name="email"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="pl-md-1" md="6">
                    <FormGroup>
                      <label>First name</label>
                      <Input
                        defaultValue={this.state.data.first_name}
                        placeholder="First name"
                        name="first_name"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="6">
                    <FormGroup>
                      <label>Last name</label>
                      <Input
                        defaultValue={this.state.data.last_name}
                        placeholder="Last name"
                        name="last_name"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Button className="btn-fill" color="primary" type="submit" value="Submit">
                  Save
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      );
    } else {
      user = (
        <CardText>No user</CardText>
      );
    }
    return (
      <div className="content">
        <div className="react-notification-alert-container">
          <NotificationAlert ref="notificationAlert" />
        </div>
        <div className="content">
          <Row>
            {user}
          </Row>
        </div>
      </div>
    );
  }
}

export default UserProfile;
