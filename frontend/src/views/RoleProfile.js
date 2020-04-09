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
import { Redirect } from 'react-router';
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
  const local = require('src/translations/' + language.code + '/roleprofile.json')
  lang[language.code] = Object.assign({}, common, local)
});

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

class RoleProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
      placeholder: "Loading",
      error_message: "",
      redirect: false,
    };

    languages.forEach((language, i) => {
      props.addTranslationForLanguage(lang[language.code], language.code);
    });

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    fetch('/rest/roles/'+this.state.data.id+"/", {
      method: 'PATCH',
      body: JSON.stringify({
          name: data.get('name'),
          permission_patient_see: 0 < data.get('permission_patient'),
          permission_patient_edit: 1 < data.get('permission_patient'),
          permission_machine_see: 0 < data.get('permission_machine'),
          permission_machine_edit: 1 < data.get('permission_machine'),
          permission_task_see: 0 < data.get('permission_task'),
          permission_task_edit: 1 < data.get('permission_task'),
          permission_message_see: 0 < data.get('permission_message'),
          permission_message_edit: 1 < data.get('permission_message'),
          permission_user_see: 0 < data.get('permission_user'),
          permission_user_edit: 1 < data.get('permission_user'),
          permission_model_see: 0 < data.get('permission_model'),
          permission_model_edit: 1 < data.get('permission_model'),
          permission_role_see: 0 < data.get('permission_role'),
          permission_role_edit: 1 < data.get('permission_role'),
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {
      console.log(response)
      this.setState({redirect: true})
    });
  }
  componentDidMount() {
    const { pk } = this.props.match.params
    fetch('/rest/roles/'+pk+'/')
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
  };
  render() {
    const t = this.props.translate
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">{t("Loading role")}...</CardTitle>
        </CardHeader>
      );
    }
    let role;
    if (this.state.error_message.length > 0) {
      role = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data.id) {
      role = (
        <Col md="8">
          <Card>
            <CardHeader>
              <h5 className="title">{t("Role profile")}</h5>
            </CardHeader>
            <CardBody>
              <Form onSubmit={this.handleSubmit}>
                <Row>
                  <Col className="pr-md-1" md="2">
                    <FormGroup>
                      <label>ID</label>
                      <Input
                        defaultValue={this.state.data.id}
                        disabled
                        placeholder="ID"
                        name="id"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="3">
                    <FormGroup>
                      <label>{t("Name")}</label>
                      <Input
                        defaultValue={this.state.data.name}
                        placeholder={t("Name")}
                        name="name"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>{t("Patients")}</label>
                      <Input
                        defaultValue={this.state.data.permission_patient_see+this.state.data.permission_patient_edit}
                        name="permission_patient"
                        type="select"
                      >
                        <option key={0} value={0}>{t("None")}</option>
                        <option key={0} value={1}>{t("See")}</option>
                        <option key={0} value={2}>{t("Edit")}</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>{t("Machines")}</label>
                      <Input
                        defaultValue={this.state.data.permission_machine_see+this.state.data.permission_machine_edit}
                        name="permission_machine"
                        type="select"
                      >
                        <option key={0} value={0}>{t("None")}</option>
                        <option key={0} value={1}>{t("See")}</option>
                        <option key={0} value={2}>{t("Edit")}</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>{t("Tasks")}</label>
                      <Input
                        defaultValue={this.state.data.permission_task_see+this.state.data.permission_task_edit}
                        name="permission_task"
                        type="select"
                      >
                        <option key={0} value={0}>{t("None")}</option>
                        <option key={0} value={1}>{t("See")}</option>
                        <option key={0} value={2}>{t("Edit")}</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>{t("Messages")}</label>
                      <Input
                        defaultValue={this.state.data.permission_message_see+this.state.data.permission_message_edit}
                        name="permission_message"
                        type="select"
                      >
                        <option key={0} value={0}>{t("None")}</option>
                        <option key={0} value={1}>{t("See")}</option>
                        <option key={0} value={2}>{t("Edit")}</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>{t("Users")}</label>
                      <Input
                        defaultValue={this.state.data.permission_user_see+this.state.data.permission_user_edit}
                        name="permission_user"
                        type="select"
                      >
                        <option key={0} value={0}>{t("None")}</option>
                        <option key={0} value={1}>{t("See")}</option>
                        <option key={0} value={2}>{t("Edit")}</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>{t("Models")}</label>
                      <Input
                        defaultValue={this.state.data.permission_machinetype_see+this.state.data.permission_machinetype_edit}
                        name="permission_model"
                        type="select"
                      >
                        <option key={0} value={0}>{t("None")}</option>
                        <option key={0} value={1}>{t("See")}</option>
                        <option key={0} value={2}>{t("Edit")}</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="2">
                    <FormGroup>
                      <label>{t("Roles")}</label>
                      <Input
                        defaultValue={this.state.data.permission_role_see+this.state.data.permission_role_edit}
                        name="permission_role"
                        type="select"
                      >
                        <option key={0} value={0}>{t("None")}</option>
                        <option key={0} value={1}>{t("See")}</option>
                        <option key={0} value={2}>{t("Edit")}</option>
                      </Input>
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
      role = (
        <CardText>{t("No role")}</CardText>
      );
    }
    return (
      <div className="content">
        {this.state.redirect && (<Redirect to={'/adm'} />)}
        <div className="react-notification-alert-container">
          <NotificationAlert ref="notificationAlert" />
        </div>
        <div className="content">
          <Row>
            {role}
          </Row>
        </div>
      </div>
    );
  }
}

export default withLocalize(RoleProfile);
