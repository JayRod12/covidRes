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
import React from "react";
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
  Input,
  Row,
  Col
} from "reactstrap";

import AssignmentTaskWindow from "views/AssignmentTaskWindow.js"

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
    };
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
    fetch('/rest/assignment_tasks/query/patient='+pk+'/')
            .then(response => {
                if (response.status > 400) {
                  throw new Error(response.status);
                }
                return response.json();
            })
            .then(data_tasks => {
                console.log(data_tasks);
                this.setState(() => {
                    return {
                        data_tasks: data_tasks,
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
          <CardTitle tag="h4">Loading machine...</CardTitle>
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
              <th className="title">Machine Profile</th>
            </CardHeader>
            <CardBody>
              <Form>
                <Row>
                  <Col className="pr-md-1" md="1">
                    <FormGroup>
                      <label>ID</label>
                      <Input
                        defaultValue={this.state.data.pk}
                        disabled
                        placeholder="ID"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="px-md-1" md="5">
                    <FormGroup>
                      <label>Model</label>
                      <Input
                        defaultValue={this.state.data.model_name}
                        placeholder="Model"
                        type="text"
                      />
                    </FormGroup>
                  </Col>
                  <Col className="pl-md-1" md="6">
                    <FormGroup>
                      <label>Location</label>
                      <Input
                        defaultValue={this.state.data.location}
                        placeholder="Location"
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
                        placeholder="Machine description"
                        rows="6"
                        type="textarea"
                      />
                    </FormGroup>
                  </Col>
                    <Col md="4">
                      <label>Assigned to</label>
                      <CardBody>
                        {this.state.data.patient_assigned === null
                          ?
                          <Row><th>None</th></Row>
                          :
                          <div>
                            <Row>
                              <th><Link to={'/patient/'+this.state.data.patient_assigned}>{this.state.data.patient_assigned_name}</Link></th>
                            </Row>
                            <Row>
                              <th><small>ID: {this.state.data.patient_assigned}</small></th>
                            </Row>
                          </div>
                        }
                      </CardBody>
                    </Col>
                </Row>
              </Form>
            </CardBody>
            <CardFooter>
              <Button className="btn-fill" color="primary" type="submit" value="Submit">
                Save
              </Button>
            </CardFooter>
          </Card>
        </Col>
      );
    } else {
      machine = (
        <CardText>No machine</CardText>
      );
    }
    console.log(machine);
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
    } else if (this.state.data_tasks.results.length > 0) {
      tasks = this.state.data_tasks.results.map((props, index) => (
        <React.Fragment>
          <Button
            block
            color={props.bool_install == 0 ? "primary" : "info"}
            onClick={() => this.pop(props)}
          >
            {props.machine_model} - {props.patient_name}
          </Button>
        </React.Fragment>
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
            {machine}
            <Col md="4">
              <Card className="card-user">
                <CardHeader>
                  <th className="title">Associated Tasks</th>
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

export default MachineProfile;
