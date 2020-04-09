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
  const local = require('src/translations/' + language.code + '/modelprofile.json')
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

class ModelProfile extends React.Component {
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

    fetch('/rest/machinetypes/'+this.state.data.pk+"/", {
      method: 'PATCH',
      body: JSON.stringify({
          name: data.get('name'),
          description: data.get('description')
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
    fetch('/rest/machinetypes/'+pk+'/')
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
          <CardTitle tag="h4">{t("Loading model")}...</CardTitle>
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
    } else if (this.state.data.pk) {
      role = (
        <Col md="8">
          <Card>
            <CardHeader>
              <h5 className="title">{t("Model profile")}</h5>
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
                  <Col className="px-md-1" md="12">
                    <FormGroup>
                      <label>{t("Description")}</label>
                      <Input
                        cols="80"
                        defaultValue={this.state.data.description}
                        placeholder={t("Model description")}
                        name="description"
                        rows="6"
                        type="textarea"
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

export default withLocalize(ModelProfile);
