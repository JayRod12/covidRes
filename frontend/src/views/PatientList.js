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

// reactstrap components
import {
  Alert,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardText,
  CardTitle,
  Table,
  Row,
  Col
} from "reactstrap";

const IS_DEV = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

class PatientRow extends React.Component {
  render() {
    return (
      <React.Fragment>
        <tr>
          <td><Link to={'/patient/' + this.props.pk}>{this.props.name}</Link></td>
          <td className="text-center">{this.props.severity}</td>
          <td className="text-center">{this.props.machine_assigned_model}</td>
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
  render() {
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">Loading patients...</CardTitle>
        </CardHeader>
      );
    }
    let patients;
    const results = IS_DEV ? this.state.data.results : this.state.data;

    if (this.state.error_message.length > 0) {
      patients = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (results.length > 0) {
      patients = results.map((entry, index) => (
        <PatientRow
          key={entry.pk}
          pk={entry.pk}
          name={entry.name}
          admission_date={prettifyDate(entry.admission_date)}
          severity={entry.severity}
          machine_assigned_model={entry.machine_assigned_model}
        />
      )
      );
    } else {
      patients = (
        <CardText>No patients</CardText>
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
          </Row>
        </div>
      </>
    );
  }
}

export default PatientList;
