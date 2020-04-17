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
import { Line, Bar, Scatter } from "react-chartjs-2";

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
  Input,
  Row,
  Table,
  Col
} from "reactstrap";

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import TextField from '@material-ui/core/TextField';

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
  const local = require('src/translations/' + language.code + '/patientprofile.json')
  lang[language.code] = Object.assign({}, common, local)
});

import moment from 'moment'
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

function plan_text2array(plan_text) {
  if (plan_text.length == 0) {
    return []
  }
  return(
    plan_text.split(';').map(item => {
      const fields = item.split(',');
      return({
        model: fields[0],
        start: moment(fields[1]).format("YYYY-MM-DD"),
        end: moment(fields[2]).format("YYYY-MM-DD")
      })
    })
  )
}

function plan_array2text(plan_array) {
  if (plan_array.length == 0) {
    return ""
  }
  return(
    plan_array.map(item => {
      return(item.join(','))
    }).join(';')
  )
}

class PatientProfile extends React.Component {
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
      data_messages: [],
      loaded_messages: false,
      placeholder_messages: "Loading",
      error_message_messages: "",
      data_locations: [],
      loaded_locations: false,
      placeholder_locations: "Loading",
      error_message_locations: "",
      severity_list: ["SEV_0","SEV_1","SEV_2","SEV_3","SEV_4","SEV_5","SEV_6"],
      graph_xy: [],
      plan_array: [],
      redirect: false,
      showDialog: false,
      selectedTask: null,
      bool_connected: false
    };

    languages.forEach((language, i) => {
      props.addTranslationForLanguage(lang[language.code], language.code);
    });

    this.handleSubmit = this.handleSubmit.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }
  _commit = () => {
      fetch('/rest/assignment_tasks/' + this.state.selectedTask.pk + "/", {
          method: 'PATCH',
          body: JSON.stringify({
              bool_completed: this.state.selectedTask.bool_install,
              bool_install: true
          }),
          headers: {
              "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
          }
      }).then(response => {
        if (response.status > 400) {
          throw new Error(response.status);
        }
        return response.json();
      }).then(data => {window.location.reload()})
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    var body = {
        name: data.get('name'),
        severity: data.get('severity'),
        location: data.get('location'),
        treatment_plan: data.get('treatment_plan'),
        description: data.get('description'),
        id1: data.get('ID1'),
        bool_connected: this.state.bool_connected
    }
    if(data.get('birth').length > 0){
      body['birth'] = new Date(data.get('birth')).toISOString()
    }
    console.log("Body:");
    console.log(body); //until here the data is properly contained in body
    fetch('/rest/patients/'+this.state.data.pk+"/", {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {
      //console.log(response)
      this.setState({redirect1: true})
    });
    this.setState({
      graph_xy: this.state.graph_xy.concat({x: new Date().valueOf(), y: parseInt(data.get('severity'))})
    })
    if (this.state.data.user_pk !== null) {
      fetch('/rest/users/'+this.state.data.user_pk+"/", {
        method: 'PATCH',
        body: JSON.stringify({
            first_name: data.get('first_name'),
            last_name: data.get('last_name')
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
        }
      }).then(response => {
        //console.log(response)
        this.setState({redirect2: true})
      });
    } else {
      this.setState({redirect2: true})
    }
  }
  sendMessage(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    console.log("patient_info", {
        message: data.get('message'),
        patient: this.props.match.params.pk
    })

    fetch('/rest/messages/', {
      method: 'POST',
      body: JSON.stringify({
          message: data.get('message'),
          patient: this.props.match.params.pk
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => response.json()).then(data => {
      this.setState({data_messages: [data, ...this.state.data_messages]})
    })
  }
  componentDidMount() {
    const { pk } = this.props.match.params
    fetch('/rest/patients/'+pk+'/')
            .then(response => {
                if (response.status > 400) {
                  throw new Error(response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                this.setState(() => {
                    const xx = data.history_severity_x.split(", ")
                    const yy = data.history_severity_y.split(", ")
                    return {
                        data: data,
                        graph_xy: xx.map((xs, i) => {return {
                          x: moment(xs).valueOf(),
                          y: parseInt(yy[i])
                        }}),
                        loaded: true,
                        bool_connected: (data.machine_assigned ? data.bool_connected : false),
                        plan_array: plan_text2array(data.treatment_plan)
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
    fetch('/rest/assignment_tasks/query/bool_completed=0&patient='+pk+'/')
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
    fetch('/rest/messages/to/'+pk+'/')
            .then(response => {
                if (response.status > 400) {
                  throw new Error(response.status);
                }
                return response.json();
            })
            .then(data_messages => {
                console.log(data_messages);
                const results = data_messages;
                this.setState(() => {
                    return {
                        data_messages: results,
                        loaded_messages: true
                    };
                });
            })
            .catch(error => {
              this.setState(() => {
                return {
                  loaded_messages: true,
                  placeholder_messages: "Failed to load",
                  error_message_messages: error,
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
  render() {
    const t = this.props.translate
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">{t("Loading patient")}...</CardTitle>
        </CardHeader>
      );
    }
    let patient;
    if (this.state.error_message.length > 0) {
      patient = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data.pk) {
      patient = (
        <Col md="7">
          <Card>
            <CardHeader>
              <h4 className="title">{t("Patient profile")}</h4>
            </CardHeader>
            <CardBody>
              <Form onSubmit={this.handleSubmit}>
              <Row>
                <Col md="6">
                  <Row>
                    <Col className="pr-md-1" md="3">
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
                        <label>{t("Severity")}</label>
                        <Input
                          defaultValue={this.state.data.severity}
                          name="severity"
                          type="select"
                        >
                          {this.state.severity_list.map((val, i) => {return (
                            <option key={i+1} value={i}>{t(val)}</option>
                          )})}
                        </Input>
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
                          placeholder={t("Location")}
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
                    <Col className="pr-md-1" md="6">
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
                    <Col className="px-md-1" md="6">
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
                    <Col className="pr-md-1" md="4">
                      <FormGroup>
                        <label>{t("Nickname")}</label>
                        <Input
                          defaultValue={this.state.data.name}
                          placeholder={t("Nickname")}
                          name="name"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                     <Col className="px-md-1" md="4">
                      <FormGroup>
                        <label>{t("ID1")}</label>
                        <Input
                          defaultValue={this.state.data.id1}
                          placeholder={t("ID1")}
                          name="ID1"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <TextField
                          id="date"
                          name="birth"
                          label="Birthday"
                          type="date"
                          defaultValue={moment(this.state.data.birth).format("YYYY-MM-DD")}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label>{t("Treatment Plan")}</label>
                    <Input
                      defaultValue={this.state.data.treatment_plan}
                      placeholder={t("Treatment Plan")}
                      name="treatment_plan"
                      type="text"
                    />
                    {this.state.plan_array.map((item, iter) => {return(
                      <tr>
                        <td>
                          <TextField
                            id={iter}
                            label="Start"
                            type="date"
                            defaultValue={moment(item.start).format("YYYY-MM-DD")}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </td>
                        <td>
                          <TextField
                            id={iter}
                            label="End"
                            type="date"
                            defaultValue={moment(item.start).format("YYYY-MM-DD")}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </td>
                      </tr>
                    )})}
                  </FormGroup>
                </Col>
                </Row>
                <Row>
                  <Col md="9">
                    <FormGroup>
                      <label>{t("Description")}</label>
                      <Input
                        cols="80"
                        defaultValue={this.state.data.description}
                        placeholder={t("Patient description")}
                        name="description"
                        rows="6"
                        type="textarea"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <label>{t("Assigned machine")}</label>
                    <CardBody>
                      {this.state.data.machine_assigned === null
                        ?
                        <h3>{t("None")}</h3>
                        :
                        <div>
                            <h3><Link to={'/machine/'+this.state.data.machine_assigned}>{this.state.data.machine_assigned_model}</Link></h3>
                            <Row>
                              <Col md="6">
                                <small>ID: {this.state.data.machine_assigned}</small>
                              </Col>
                              <Col md="6">
                                <Input
                                  checked={this.state.bool_connected}
                                  onChange={() => this.setState({bool_connected: !this.state.bool_connected})}
                                  name="bool_connected"
                                  type="checkbox"
                                />
                                <label>{t("Connected")}</label>
                              </Col>
                            </Row>
                        </div>
                      }
                    </CardBody>
                  </Col>
                </Row>
                <Button className="btn-fill" color="primary" type="submit" value="Submit">
                  {t("Save")}
                </Button>
              </Form>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h4 className="title">{t("Severity evolution")}</h4>
            </CardHeader>
            <CardBody>
              <Scatter
                data={
                  canvas => {
                    let ctx = canvas.getContext("2d");

                    let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

                    gradientStroke.addColorStop(1, "rgba(29,140,248,0.2)");
                    gradientStroke.addColorStop(0.4, "rgba(29,140,248,0.0)");
                    gradientStroke.addColorStop(0, "rgba(29,140,248,0)"); //blue colors

                    return {
                      datasets: [
                        {
                          label: t("Severity"),
                          fill: true,
                          showLine: true,
                          lineTension: 0,
                          backgroundColor: gradientStroke,
                          borderColor: "#1f8ef1",
                          borderWidth: 2,
                          borderDash: [],
                          borderDashOffset: 0.0,
                          pointBackgroundColor: "#1f8ef1",
                          pointBorderColor: "rgba(255,255,255,0)",
                          pointHoverBackgroundColor: "#1f8ef1",
                          pointBorderWidth: 20,
                          pointHoverRadius: 4,
                          pointHoverBorderWidth: 15,
                          pointRadius: 4,
                          data: [...this.state.graph_xy, {x: new Date().valueOf(), y: this.state.graph_xy[this.state.graph_xy.length-1]}]
                        }
                      ]
                    };
                  }
                }
                options={{
                  maintainAspectRatio: false,
                  legend: {
                    display: false
                  },
                  tooltips: {
                    backgroundColor: "#f5f5f5",
                    titleFontColor: "#333",
                    bodyFontColor: "#666",
                    bodySpacing: 4,
                    xPadding: 12,
                    mode: "nearest",
                    intersect: 0,
                    position: "nearest",
                    callbacks: {
                        title: function (tooltipItem, data) {
                            return t("Date") + ": " + moment(data.labels[tooltipItem[0].index]).format("HH:mm (D-MMM-YYYY)");
                        },
                        label: function(tooltipItems, data) {
                            return t("Severity") + ": " + tooltipItems.yLabel;
                        },
                        footer: function (tooltipItem, data) { return "..."; }
                    }
                  },
                  responsive: true,
                  scales: {
                    yAxes: [
                      {
                        barPercentage: 1.6,
                        gridLines: {
                          drawBorder: false,
                          color: "rgba(29,140,248,0.0)",
                          zeroLineColor: "transparent"
                        },
                        ticks: {
                          suggestedMin: 0,
                          suggestedMax: 6,
                          padding: 2,
                          fontColor: "#9a9a9a"
                        }
                      }
                    ],
                    xAxes: [
                      {
                        barPercentage: 1.6,
                        gridLines: {
                          display: false,
                          drawBorder: false,
                          color: "rgba(29,140,248,0.1)",
                          zeroLineColor: "transparent"
                        },
                        ticks: {
                          display: false,
                          padding: 20,
                          fontColor: "#9a9a9a"
                        }
                      }
                    ]
                  }
                }}
              />
            </CardBody>
          </Card>
        </Col>
      );
    } else {
      patient = (
        <CardText>{t("No patient")}</CardText>
      );
    }
    console.log(patient);
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
      tasks = this.state.data_tasks.map((entry, index) => (
        <tr>
          <td><Link onClick={() => {this.setState({showDialog: true, selectedTask: entry})}}>{entry.bool_install ? t("Remove") : t("Install")}</Link></td>
          <td><Link to={'/machine/'+entry.machine}>{entry.machine_model}</Link></td>
          <td>{moment(entry.date).format("HH:mm (DD-MMM-YYYY)")}</td>
        </tr>
        )
      );
    } else {
      tasks = (
        <CardText>{t("No tasks")}</CardText>
      );
    }
    let messages;
    if (this.state.error_message_messages.length > 0) {
      tasks = (
        <Alert color="danger">
          {this.state.error_message_messages} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data_messages.length > 0) {
      messages = this.state.data_messages.map((props, index) => (
        <React.Fragment>
          <Row>
            <Col md="6">
              <CardText style={{ 'fontSize': '11px' }}>{props.sender_role} {props.sender_lastname}</CardText>
            </Col>
            <Col md="5">
              <span className="pull-right">
                <CardText style={{ 'fontSize': '11px' }}>{moment(props.date).format("HH:mm (D-MMM-YYYY)")}</CardText>
              </span>
            </Col>
          </Row>
          <Col md="11">
          <Alert color="info" style={{ 'padding': '0.4rem 1.25rem' }}>
            <span>{props.message}</span>
          </Alert>
          </Col>
        </React.Fragment>
        )
      );
    } else {
      messages = (
        <CardText>{t("No messages")}</CardText>
      );
    }
    console.log(messages);
    return (
      <div className="content">
        {this.state.redirect1 && this.state.redirect2 && (<Redirect to={'/patients'} />)}
        <div className="content">
          <Row>
            {this.state.selectedTask && (
              <Dialog
                  open={this.state.showDialog}
                  onClose={() => this._closeDialog(false)}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
              >
              <DialogTitle id="alert-dialog-title">
                <h3 align="center">{this.state.selectedTask.bool_install ? t("Remove") : t("Install")}</h3>
                <h5 align="center">{moment(this.state.selectedTask.date).format("HH:mm (DD-MMM-YYYY)")}</h5>
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  <Row>
                    <Col md="5">
                      <h4 align="center"><Link to={'/patient/'+this.state.selectedTask.patient}>{this.state.selectedTask.patient_name}</Link></h4>
                    </Col>
                    <Col md="2">
                      {" => "}
                    </Col>
                    <Col md="5">
                      <h4 align="center"><Link to={'/machine/'+this.state.selectedTask.machine}>{this.state.selectedTask.machine_model}</Link></h4>
                    </Col>
                  </Row>
                  <Col md="12">
                    By pressing Ok you confirm that you realized the task.
                  </Col>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {this.setState({showDialog: false})}} color="primary">
                  {t("Cancel")}
                </Button>
                <Button onClick={this._commit} color="primary">
                  {t("Ok")}
                </Button>
              </DialogActions>
              </Dialog>
            )}
            {patient}
            <Col md="5">
              <Card className="card-user">
                <CardHeader>
                  <h4>{t("Associated tasks")}</h4>
                </CardHeader>
                <CardBody>
                  <div style={{maxHeight: "200px", overflow: "auto"}}>
                    <Table className="tablesorter" >
                      <thead className="text-primary">
                        <tr>
                          <th>{t("Task")}</th>
                          <th>{t("Model")}</th>
                          <th>{t("Date")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
              <Card className="card-user">
                <CardHeader>
                  <h4>{t("Messages")}</h4>
                </CardHeader>
                <CardBody>
                  <div style={{maxHeight: "200px", overflow: "auto"}}>
                    {messages}
                  </div>
                </CardBody>
                <CardFooter>
                  <Form onSubmit={this.sendMessage}>
                    <FormGroup>
                      <label>{t("Message")}</label>
                      <Input
                        cols="80"
                        placeholder={t("Message")}
                        name="message"
                        rows="3"
                        type="textarea"
                      />
                    </FormGroup>
                    <Button>
                      {t("Send")}
                    </Button>
                  </Form>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default withLocalize(PatientProfile);
