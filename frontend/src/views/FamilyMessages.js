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
// react plugin for creating notifications over the dashboard
import NotificationAlert from "react-notification-alert";

// reactstrap components
import {
  Alert,
  UncontrolledAlert,
  Button,
  Collapse,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardText,
  CardTitle,
  CardSubtitle,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Col
} from "reactstrap";

const IS_DEV = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

class DoctorMessage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Row>
          <Col md="3">
            <CardText style={{ 'font-size': '11px' }}>From: Doctor {this.props.doctorName}</CardText>
          </Col>
          <Col md="3">
            <CardText style={{ 'font-size': '11px' }}>To: Patient {this.props.patientName}</CardText>
          </Col>
          <Col md="6">
            <span className="pull-right">
              <CardText style={{ 'font-size': '11px' }}>{this.props.time}</CardText>
            </span>
          </Col>
        </Row>
        <Alert color="info" style={{ 'padding': '0.4rem 1.25rem' }}>
          <span>{this.props.message}</span>
        </Alert>
      </React.Fragment>
    );
  }
}
function prettifyDate(raw_date) {
  return new Date(raw_date).toGMTString();
};

const PatientDropdown = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  console.log('Props');
  console.log(props);
  if (!props.patient_data) {
    return null;
  }

  var list = props.patient_data.map((entry, index) => {
    return (
      <DropdownItem key={entry.pk}>{entry.name}</DropdownItem>
    );
  });
  var toggle_sign = (dropdownOpen
    ? <span style={{ 'font-size': '9px' }}>&#9650;</span>
    : <span style={{ 'font-size': '9px' }}>&#9660;</span>
  );
  return (
    <CardSubtitle>
      <Dropdown isOpen={dropdownOpen} toggle={toggle} color="secondary">
        <DropdownToggle>
          <Row>
            <Col md="10">
              Filter messages of a patient
              </Col>
            <Col md="2">
              {toggle_sign}
            </Col>
          </Row>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>All patients</DropdownItem>
          <DropdownItem divider />
          {list}
        </DropdownMenu>
      </Dropdown>
    </CardSubtitle>
  );
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

class MessageComposerForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    var csrftoken = getCookie('csrftoken');
    data.set('csrfmiddlewaretoken', csrftoken);
    // data.set('sender', -1);

    fetch('/rest/messages/', {
      method: 'POST',
      body: data,
    });
  }

  render() {
    if (!this.props.patient_data) {
      return null;
    }
    var patient_list = this.props.patient_data.map((entry, index) => {
      return (
        <option key={entry.pk} value={entry.pk}>{entry.name}</option>
      );
    });
    var toggle_sign = (this.state.isOpen
      ? <span style={{ 'font-size': '9px' }}>&#9650;</span>
      : <span style={{ 'font-size': '9px' }}>&#9660;</span>
    );
    return (
      <CardBody>
        <Row>
          <Col md="12">
            <Button
              color="secondary"
              onClick={() => this.setState({ isOpen: !this.state.isOpen })}
              style={{ marginBottom: '1rem' }}>
              <Row>
                <Col md="10">Compose new message
              </Col>
                <Col md="2">{toggle_sign}
                </Col>
              </Row></Button>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <Collapse isOpen={this.state.isOpen}>
              <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                  <Label for="receiverSelect">Select Patient</Label>
                  <Input type="select" name="patient" id="receiverSelect">
                    {patient_list}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="messageText">Message</Label>
                  <Input type="textarea" name="message" id="messageText" />
                </FormGroup>
                <Button>Submit</Button>
              </Form>
            </Collapse>
          </Col>
        </Row>
      </CardBody>
    );
  }
}

class FamilyNotifications extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
      placeholder: "Loading",
      error_message: "",
      patient_data: [],
    };
  }
  componentDidMount() {
    fetch("/rest/messages/")
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
    fetch("/rest/patients/")
      .then(response => {
        if (response.status > 400) {
          throw new Error(response.status);
        }
        return response.json();
      })
      .then(data => {
        this.setState({
          patient_data: data,
        });
      })
      .catch(error => {
        console.log("Error fetching patients " + error);
      })
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
    const results = this.state.data;

    if (this.state.error_message.length > 0) {
      messages = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin/" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (results?.length > 0) {
      messages = results.map((entry, index) => (
        <DoctorMessage
          key={entry.pk}
          doctorName={entry.sender_lastname}
          patientName={entry.patient_lastname}
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
                  <CardTitle tag="h3">Family Messages</CardTitle>
                </CardHeader>
                <MessageComposerForm patient_data={this.state.patient_data} />
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <Row>
                    <Col md="6">
                      <CardTitle tag="h4">Messages</CardTitle>
                    </Col>
                    <Col md="6">
                      <span className="pull-right">
                        <PatientDropdown patient_data={this.state.patient_data} />
                      </span>
                    </Col>
                  </Row>
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
