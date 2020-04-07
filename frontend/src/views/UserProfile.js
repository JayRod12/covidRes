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

import {
  withLocalize,
  Translate,
  LocalizeContext,
  LocalizeProvider
} from 'react-localize-redux';
import { renderToStaticMarkup } from 'react-dom/server';

import languages from "src/translations/languages.json"
var lang = {}
languages.forEach((language, i) => {
  const common = require('src/translations/' + language.code + '/common.json')
  const local = require('src/translations/' + language.code + '/userprofile.json')
  lang[language.code] = Object.assign({}, common, local)
});

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
      loaded_roles: false,
      placeholder: "Loading",
      error_message: "",
    };
    languages.forEach((language, i) => {
      props.addTranslationForLanguage(lang[language.code], language.code);
    });

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    var body = {
        username: data.get('username'),
        role: data.get('role'),
        email: data.get('email'),
        first_name: data.get('first_name'),
        last_name: data.get('last_name')
    }
    if (data.get('pass').length > 0 && data.get('pass') == data.get('pass_repeat')) {
      body.new_pass = data.get('pass')
    }

    fetch('/rest/users/'+this.state.data.pk+"/", {
      method: 'PATCH',
      body: JSON.stringify(body),
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
                const data_roles = data
                this.setState({data_roles: data_roles, loaded_roles: true});
            })
            .catch(error => {
              console.log(error)
            });
  };
  render() {
    const t = this.props.translate
    if (!(this.state.loaded && this.state.loaded_roles)) {
      return (
        <CardHeader>
          <CardTitle tag="h4">{t("Loading user")}...</CardTitle>
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
              <h5 className="title">{t("User profile")}</h5>
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
                      <label>{t("Username")}</label>
                      <Input
                        defaultValue={this.state.data.username}
                        placeholder={t("Username")}
                        name="username"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>{t("Role")}</label>
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
                      <label>{t("Email")}</label>
                      <Input
                        defaultValue={this.state.data.email}
                        placeholder={t("Email")}
                        name="email"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="pl-md-1" md="6">
                    <FormGroup>
                      <label>{t("First name")}</label>
                      <Input
                        defaultValue={this.state.data.first_name}
                        placeholder={t("First name")}
                        name="first_name"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="6">
                    <FormGroup>
                      <label>{t("Last name")}</label>
                      <Input
                        defaultValue={this.state.data.last_name}
                        placeholder={t("Last name")}
                        name="last_name"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="pl-md-1" md="6">
                    <FormGroup>
                      <label>{t("New password")}</label>
                      <Input
                        placeholder={t("Password")}
                        name="pass"
                        type="password"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="6">
                    <FormGroup>
                      <label>{t("New password (repeat)")}</label>
                      <Input
                        placeholder={t("Password")}
                        name="pass_repeat"
                        type="password"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Button className="btn-fill" color="primary" type="submit" value="Submit">
                  {t("Save")}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      );
    } else {
      user = (
        <CardText>{t("No user")}</CardText>
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

export default withLocalize(UserProfile);
