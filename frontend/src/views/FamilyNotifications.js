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
  CardText,
  CardTitle,
  Row,
  Col
} from "reactstrap";

class DoctorMessage extends React.Component {
  render() {
    return (
          <React.Fragment>
            <Row>
              <Col md="6">
                <CardText>Doctor {this.props.doctorName}</CardText>
              </Col>
              <Col md="6">
                <span className="pull-right">
                  <CardText>{this.props.time}</CardText>
                </span>
              </Col>
            </Row>
            <Alert color="info">
              <span>{this.props.message}</span>
            </Alert>
          </React.Fragment>
    );
  }
}
function prettifyDate(raw_date) {
  return new Date(raw_date).toGMTString();
};

class FamilyNotifications extends React.Component {
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
    fetch("rest/messages/received/")
            .then(response => {
                console.log('Response');
                console.log(response);
                if (response.status > 400) {
                  throw new Error(response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Data');
                console.log(data);
                this.setState(() => {
                    return {
                        data,
                        loaded: true
                    };
                });
            })
            .catch(error => {
              console.log('Error');
              console.log(error);
              this.setState(() => {
                return {
                  loaded: true,
                  placeholder: "Failed to load",
                  error_message: "You don't have permission to view these messages.",
                };
              });
            });
  };
  notify = place => {
    var color = Math.floor(Math.random() * 5 + 1);
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
      place: place,
      message: (
        <div>
          <div>
            Welcome to <b>Black Dashboard React</b> - a beautiful freebie for
            every web developer.
          </div>
        </div>
      ),
      type: type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 7
    };
    this.refs.notificationAlert.notificationAlert(options);
  };
  render() {
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">Loading messages...</CardTitle>
        </CardHeader>
      );
    }
    console.log('here');
    console.log(this.state.data);
    console.log(this.state.data.length);
    let messages;
    if (this.state.error_message.length > 0) {
      messages = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin/" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data.results?.length > 0) {
      messages = this.state.results.data.map((entry, index) => (
        <DoctorMessage
          key={entry.id}
          doctorName={entry.sender_username}
          time={prettifyDate(entry.date)}
          message={entry.message}
          />
        )
      );
    } else {
      messages = (
        <CardText>No message history</CardText>
      );
    }
    console.log(messages);
    return (
      <React.Fragment>
        <div className="content">
          <div className="react-notification-alert-container">
            <NotificationAlert ref="notificationAlert" />
          </div>
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Family Messages</CardTitle>
                </CardHeader>
                <CardBody>
                  {messages}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </React.Fragment>
    );
  }
}

// <DoctorMessage
//                     doctorName="Smith"
//                     time="Mon 13th Feb 18:24am"
//                     message="The patient has been discharged" />
//                   <DoctorMessage
//                     doctorName="Smith"
//                     time="Mon 12th Feb 11:57am"
//                     message="The patient seems almost recovered" />
//                   <DoctorMessage
//                     doctorName="Smith"
//                     time="Mon 11th Feb 10:20am"
//                     message="The symptoms have improved this morning" />
//                   <DoctorMessage
//                     doctorName="Cheung"
//                     time="Mon 10th Feb 13:24pm"
//                     message="There are no changes to the patient's condition today." />
//                   <DoctorMessage
//                     doctorName="Smith"
//                     time="Mon 8th Feb 09:24am"
//                    message="The patient was brought in today. The ventilator is helping him stabilize and we think he will improve over the next few days." />


export default FamilyNotifications;
