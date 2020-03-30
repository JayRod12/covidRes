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
  Col
} from "reactstrap";

import moment from 'moment'

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
      graph_xy: []
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    console.log("patient_info", {
        name: data.get('name'),
        severity: data.get('severity'),
        location: data.get('location'),
        description: data.get('description')
    })

    fetch('/rest/patients/'+this.state.data.pk+"/", {
      method: 'PATCH',
      body: JSON.stringify({
          name: data.get('name'),
          severity: data.get('severity'),
          location: data.get('location'),
          description: data.get('description')
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    })
    this.setState({
      graph_xy: this.state.graph_xy.concat({x: new Date().valueOf(), y: parseInt(data.get('severity'))})
    })
    if (this.state.data.user_pk !== null) {
      fetch('/rest/users/'+this.state.data.pk+"/", {
        method: 'PATCH',
        body: JSON.stringify({
            first_name: data.get('first_name'),
            last_name: data.get('last_name')
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
        }
      })
    }
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
    fetch('/rest/assignment_tasks/query/patient='+pk+'/')
            .then(response => {
                if (response.status > 400) {
                  throw new Error(response.status);
                }
                return response.json();
            })
            .then(data_tasks => {
                console.log(data_tasks);
                const results = IS_DEV ? data_tasks.results : data_tasks;
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
          machine_model={props.machine_model}
          patient_name={props.patient_name}
          machine_location={props.machine_location}
          patient_location={props.patient_location}
          bool_install={props.bool_install}
        />
      ),
      type: type,
      icon: "tim-icons icon-bell-55",
    };
    this.refs.notificationAlert.notificationAlert(options);
  };
  render() {
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">Loading patient...</CardTitle>
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
        <Col md="8">
          <Card>
            <CardHeader>
              <h5 className="title">Patient Profile</h5>
            </CardHeader>
            <CardBody>
              <Form onSubmit={this.handleSubmit}>
                <Row>
                  <Col className="pr-md-1" md="1">
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
                      <label>Username</label>
                      <Input
                        defaultValue={this.state.data.name}
                        placeholder="Username"
                        name="name"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="2">
                    <FormGroup>
                      <label>Severity</label>
                      <Input
                        defaultValue={this.state.data.severity}
                        placeholder="Severity"
                        name="severity"
                        type="number"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="5">
                    <FormGroup>
                      <label>Location</label>
                      <Input
                        defaultValue={this.state.data.location}
                        placeholder="Location"
                        name="location"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="pr-md-1" md="6">
                    <FormGroup>
                      <label>First Name</label>
                      <Input
                        defaultValue={this.state.data.first_name}
                        placeholder="First Name"
                        name="first_name"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="6">
                    <FormGroup>
                      <label>Last Name</label>
                      <Input
                        defaultValue={this.state.data.last_name}
                        placeholder="Last Name"
                        name="last_name"
                        type="text"
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
                        placeholder="Patient description"
                        name="description"
                        rows="6"
                        type="textarea"
                      />
                    </FormGroup>
                  </Col>
                    <Col md="4">
                      <label>Assigned Machine</label>
                      <CardBody>
                        {this.state.data.machine_assigned === null
                          ?
                          <Row><h3>None</h3></Row>
                          :
                          <div>
                            <Row>
                              <h3><Link to={'/machine/'+this.state.data.machine_assigned}>{this.state.data.machine_assigned_model}</Link></h3>
                              <small>ID: {this.state.data.machine_assigned}</small>
                            </Row>
                          </div>
                        }
                      </CardBody>
                    </Col>
                </Row>
                <Button className="btn-fill" color="primary" type="submit" value="Submit">
                  Save
                </Button>
              </Form>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h5 className="title">Severity evolution</h5>
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
                      labels: [...this.state.graph_xy, {x: new Date().valueOf(), y: this.state.graph_xy[this.state.graph_xy.length-1]}].map((xy) => {return new Date(xy['x']).toISOString()}),
                      datasets: [
                        {
                          label: "Data",
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
                            return "Date: " + data.labels[tooltipItem[0].index];
                        },
                        label: function(tooltipItems, data) {
                            return "Severity: " + tooltipItems.yLabel;
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
        <CardText>No patient</CardText>
      );
    }
    console.log(patient);
    if (!this.state.loaded_tasks) {
      return (
        <CardHeader>
          <CardTitle tag="h4">Loading tasks...</CardTitle>
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
        <CardText>No tasks</CardText>
      );
    }
    console.log(tasks);
    return (
      <div className="content">
        <div className="react-notification-alert-container">
          <NotificationAlert ref="notificationAlert" />
        </div>
        <div className="content">
          <Row>
            {patient}
            <Col md="4">
              <Card className="card-user">
                <CardHeader>
                  <h6>Associated Tasks</h6>
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

export default PatientProfile;
