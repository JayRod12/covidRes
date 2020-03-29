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
  CardTitle,
  Row,
  Col
} from "reactstrap";

class AssignmentTaskWindow extends React.Component {
  render() {
    return (
          <React.Fragment>
            {this.props.bool_install == 0 ? <th>Remove Machine</th> : <th>Install Machine</th>}
            <tr>
              <p>
                <Link to={'/machine/'+this.props.machine}>{this.props.machine_model}</Link>
                <small>location: {this.props.machine_location}</small>
              </p>
              <p>
                <Link to={'/patient/'+this.props.patient}>{this.props.patient_name}</Link>
                <small>location: {this.props.patient_location}</small>
              </p>
            </tr>
          </React.Fragment>
    );
  }
}

class AssignmentTask extends React.Component {
  pop = props => {
    var color;
    color = 1;
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
      place: "tc",
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
        />
      ),
      type: type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 7
    };
    this.refs.notificationAlert.notificationAlert(options);
  };
  render() {
    return (
          <React.Fragment>
            <UncontrolledAlert
              block
              color={this.props.bool_install == 0 ? "primary" : "info"}
              onClick={() => this.pop(this.props)}
            >
              Bottom Left
            </UncontrolledAlert>
          </React.Fragment>
    );
  }
}

class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
      placeholder: "Loading",
      error_message: "",
    };
  }
  componentDidMount() {
    fetch("rest/assignment_tasks/")
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
                  error_message: "You don't have permission to view these tasks.",
                };
              });
            });
  };
  render() {
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">Loading tasks...</CardTitle>
        </CardHeader>
      );
    }
    let tasks;
    if (this.state.error_message.length > 0) {
      tasks = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data.results.length > 0) {
      tasks = this.state.data.results.map((props, index) => (
        <AssignmentTask
          key={props.pk}
          pk={props.pk}
          machine={props.machine}
          patient={props.patient}
          machine_model={props.machine_model}
          patient_name={props.patient_name}
          machine_location={props.machine_location}
          patient_location={props.patient_location}
          />
        )
      );
    } else {
      tasks = (
        <CardText>No tasks</CardText>
      );
    }
    console.log(tasks);
    return (
      <>
        <div className="content">
          <div className="react-notification-alert-container">
            <NotificationAlert ref="notificationAlert" />
          </div>
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Tasks</CardTitle>
                </CardHeader>
                <CardBody>
                  {tasks}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default TaskList;
