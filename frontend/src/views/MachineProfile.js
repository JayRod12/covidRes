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
import Select from 'react-select';
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

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
  const local = require('src/translations/' + language.code + '/machineprofile.json')
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

class MachineProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
      placeholder: "Loading",
      error_message: "",
      data_tasks: [],
      loaded_tasks: false,
      placeholder_tasks: "Loading",
      error_message_tasks: "",
      data_locations: [],
      loaded_locations: false,
      placeholder_locations: "Loading",
      error_message_locations: "",
      redirect: false,
      showDialog: false,
    };

    languages.forEach((language, i) => {
      props.addTranslationForLanguage(lang[language.code], language.code);
    });

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReplicate = this.handleReplicate.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    fetch('/rest/machines/'+this.state.data.pk+"/", {
      method: 'PATCH',
      body: JSON.stringify({
          location: data.get('location'),
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
  handleReplicate(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    fetch('/rest/machines/', {
      method: 'POST',
      body: JSON.stringify({
          number: data.get('number'),
          model: this.state.data.model,
          location: this.state.data.location,
          description: this.state.data.description
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
    fetch('/rest/machines/'+pk+'/')
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
                        data,
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
    fetch('/rest/assignment_tasks/query/bool_completed=0&machine='+pk+'/')
            .then(response => {
                if (response.status > 400) {
                  throw new Error(response.status);
                }
                return response.json();
            })
            .then(data_tasks => {
                console.log(data_tasks);
                const results = data_tasks;
                this.setState(() => {
                    return {
                        data_tasks: results,
                        loaded_tasks: true
                    };
                });
            })
            .catch(error => {
              this.setState(() => {
                return {
                  loaded_tasks: true,
                  placeholder_tasks: "Failed to load",
                  error_message_tasks: error,
                };
              });
            });
    fetch('/rest/locations/')
            .then(response => {
                if (response.status > 400) {
                  throw new Error(response.status);
                }
                return response.json();
            })
            .then(data_locations => {
                console.log(data_locations);
                const results = data_locations;
                this.setState(() => {
                    return {
                        data_locations: results,
                        loaded_locations: true
                    };
                });
            })
            .catch(error => {
              this.setState(() => {
                return {
                  loaded_locations: true,
                  placeholder_locations: "Failed to load",
                  error_message_locations: error,
                };
              });
            });
  };
  pop = props => {
    var color;
    color = props.bool_install == 0 ? 1 : 5;
    var type;
    switch (color) {
      case 1:
        type = "primary";
        break;
      case 2:
        type = "success";
        break;
      case 3:
        type = "danger";
        break;
      case 4:
        type = "warning";
        break;
      case 5:
        type = "info";
        break;
      default:
        break;
    }
    var options = {};
    options = {
      place: "tr",
      message: (
        <AssignmentTaskWindow
          key={props.pk}
          pk={props.pk}
          machine={props.machine}
          patient={props.patient}
          bool_install={props.bool_install}
          machine_model={props.machine_model}
          patient_name={props.patient_name}
          machine_location={props.machine_location}
          patient_location={props.patient_location}
          date={props.date}
        />
      ),
      type: type,
      icon: "tim-icons icon-bell-55",
    };
    this.refs.notificationAlert.notificationAlert(options);
  };
  render() {
    const t = this.props.translate
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">{t("Loading machine")}...</CardTitle>
        </CardHeader>
      );
    }
    let machine;
    if (this.state.error_message.length > 0) {
      machine = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data.pk) {
      machine = (
        <Col md="8">
          <Card>
            <CardHeader>
              <h5 className="title">{t("Machine Profile")}</h5>
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
                  <Col className="px-md-1" md="4">
                    <FormGroup>
                      <label>{t("Model")}</label>
                      <Input
                        defaultValue={this.state.data.model_name}
                        disabled
                        placeholder={t("Model")}
                        name="model_name"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="6">
                    <FormGroup>
                      <label>{t("Location")}</label>
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isClearable={true}
                        defaultValue={{value: this.state.data.location, label: this.state.data.location_name}}
                        name="location"
                        options={this.state.data_locations.map(item => {return({value: item.pk, label: item.name})})}
                        filterOptions={{
                          matchFrom: 'start'
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="8">
                    <FormGroup>
                      <label>Description</label>
                      <Input
                        cols="80"
                        defaultValue={this.state.data.description}
                        placeholder={t("Machine description")}
                        name="description"
                        rows="6"
                        type="textarea"
                      />
                    </FormGroup>
                  </Col>
                    <Col md="4">
                      <label>{t("Assigned to")}</label>
                      <CardBody>
                        {this.state.data.patient_assigned === null
                          ?
                          <Row><h3>{t("None")}</h3></Row>
                          :
                          <div>
                            <Row>
                              <h3><Link to={'/patient/'+this.state.data.patient_assigned}>{this.state.data.patient_assigned_name}</Link></h3>
                              <small>ID: {this.state.data.patient_assigned}</small>
                            </Row>
                          </div>
                        }
                      </CardBody>
                    </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Button className="btn-fill" color="primary" type="submit" value="Submit">
                      {t("Save")}
                    </Button>
                  </Col>
                  <Col md="6">
                    <Button className="btn-fill" color="primary" onClick={() => {this.setState({showDialog: true})}}>
                      Replicate
                    </Button>
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Col>
      );
    } else {
      machine = (
        <CardText>{t("No machine")}</CardText>
      );
    }
    console.log(machine);
    if (!this.state.loaded_tasks) {
      return (
        <CardHeader>
          <CardTitle tag="h4">{t("Loading tasks")}...</CardTitle>
        </CardHeader>
      );
    }
    let tasks;
    if (this.state.error_message_tasks.length > 0) {
      tasks = (
        <Alert color="danger">
          {this.state.error_message_tasks} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data_tasks.length > 0) {
      tasks = this.state.data_tasks.map((props, index) => (
        <Button
          key = {props.pk}
          block
          color={props.bool_install == 0 ? "primary" : "info"}
          onClick={() => this.pop(props)}
        >
          {props.machine_model} - {props.patient_name}
        </Button>
        )
      );
    } else {
      tasks = (
        <CardText>{t("No tasks")}</CardText>
      );
    }
    console.log(tasks);
    return (
      <div className="content">
        {this.state.redirect && (<Redirect to={'/machines'} />)}
        <div className="react-notification-alert-container">
          <NotificationAlert ref="notificationAlert" />
        </div>
        <div className="content">
          <Row>
              <Dialog
                  open={this.state.showDialog}
                  onClose={() => this._closeDialog(false)}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
              >
                <Form onSubmit={this.handleReplicate}>
                  <DialogTitle id="alert-dialog-title">Replicate machine</DialogTitle>
                  <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        <Row>
                          <Col md="8">
                            This will create machines with the same properties as the one selected
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <label>How many?</label>
                              <Input
                                defaultValue={1}
                                name="number"
                                type="number"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={() => {this.setState({showDialog: false})}} color="primary">
                          {t("Cancel")}
                      </Button>
                      <Button color="primary" type="submit" value="Submit">
                          {t("Ok")}
                  </Button>
                  </DialogActions>
                </Form>
              </Dialog>
            {machine}
            <Col md="4">
              <Card className="card-user">
                <CardHeader>
                  <h5 className="title">{t("Associated tasks")}</h5>
                </CardHeader>
                <CardBody>
                  {tasks}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default withLocalize(MachineProfile);
