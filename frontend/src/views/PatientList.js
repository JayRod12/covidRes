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

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col
} from "reactstrap";

class PatientRow extends React.Component {
  render() {
    return (
          <React.Fragment>
            <tr>
              <td>{this.props.name}</td>
              <td className="text-center">{this.props.severity}</td>
              <td className="text-center">{this.props.machine_pk}</td>
              <td>{this.props.admission_date}</td>
            </tr>
          </React.Fragment>
    );
  }
}
function prettifyDate(raw_date) {
  return new Date(raw_date).toGMTString();
};

class PatientList extends React.Component {
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
    fetch("rest/patients/")
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
                  error_message: "You don't have permission to view these patients.",
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
          <CardTitle tag="h4">Loading patients...</CardTitle>
        </CardHeader>
      );
    }
    let patients;
    if (this.state.error_message.length > 0) {
      patients = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data.results.length > 0) {
      patients = this.state.data.results.map((entry, index) => (
        <PatientRow
          key={entry.id}
          name={entry.name}
          admission_date={prettifyDate(entry.admission_date)}
          severity={entry.severity}
          machine_pk={entry.machine_pk}
          />
        )
      );
    } else {
      patients = (
        <CardText>No message history</CardText>
      );
    }
    console.log(patients);
    return (
      <>
        <div className="content">
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Patients</CardTitle>
                </CardHeader>
                <CardBody>
                  <Table className="tablesorter" responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Name</th>
                        <th className="text-center">Severity</th>
                        <th className="text-center">Machine</th>
                        <th>Admission date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
            <Col md="12">
              <Card className="card-plain">
                <CardHeader>
                  <CardTitle tag="h4">Patients on Plain Background</CardTitle>
                </CardHeader>
                <CardBody>
                  <Table className="tablesorter" responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Name</th>
                        <th className="text-center">Severity</th>
                        <th className="text-center">Machine</th>
                        <th>Admission date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default PatientList;
