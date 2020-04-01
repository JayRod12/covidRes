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
import { Redirect } from 'react-router';
import { NavLink, Link } from "react-router-dom";

// reactstrap components
import {
  Alert,
  Button,
  Collapse,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardText,
  CardTitle,
  Table,
  FormGroup,
  Form,
  Input,
  Row,
  Col
} from "reactstrap";

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

class PatientRow extends React.Component {
  render() {
    return (
      <React.Fragment>
        <tr>
          <td><Link to={'/patient/' + this.props.pk}>{this.props.name}</Link></td>
          <td className="text-center">{this.props.severity}</td>
          <td>{this.props.location}</td>
          <td>{this.props.machine_assigned_model}</td>
          <td>{moment(this.props.admission_date).format("HH:mm (DD-MMM-YYYY)")}</td>
        </tr>
      </React.Fragment>
    );
  }
}

class PatientList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
      placeholder: "Loading",
      error_message: "",
      severity_list: ["Healed", "Low", "Moderate", "Medium", "High", "Very high", "Dead"],
      redirect: 0,
      create_isOpen: false,
      filter_isOpen: false,
      filter_name: "--(All)--",
      filter_severity: "--(All)--",
      filter_machine: "--(All)--",
      filter_location: "--(All)--"
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    console.log({
        name: data.get('name'),
        severity: data.get('severity')
    })

    fetch('/rest/patients/', {
      method: 'POST',
      body: JSON.stringify({
          name: data.get('name'),
          severity: parseInt(data.get('severity'))
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {return response.json()}).then(data => {
      this.setState({redirect: data.pk})
    })
  }
  renderRedirect = () => {
    if (this.state.redirect > 0) {
      return (<Redirect to={'/patient/'+this.state.redirect} />)
    }
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

    const models = [...new Set(results.map(patient => patient.machine_assigned_model))]
    const locations = [...new Set(results.map(patient => patient.location))]

    if (this.state.error_message.length > 0) {
      patients = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (results.length > 0) {
      patients = results.map((entry, index) => {
        if (
          (this.state.filter_severity == "--(All)--" || this.state.filter_severity == entry.severity) &&
          (this.state.filter_machine == "--(All)--" || this.state.filter_machine == entry.machine_assigned_model || this.state.filter_machine == "" && entry.machine_assigned_model == null) &&
          (this.state.filter_location == "--(All)--" || this.state.filter_location == entry.location) &&
          (this.state.filter_name == "--(All)--" || this.state.filter_name.length <= entry.name.length && this.state.filter_name.toLowerCase() == entry.name.substring(0, this.state.filter_name.length).toLowerCase())
        ) {return (
          <PatientRow
            key={entry.pk}
            pk={entry.pk}
            name={entry.name}
            admission_date={entry.admission_date}
            severity={entry.severity}
            location={entry.location}
            machine_assigned_model={entry.machine_assigned_model}
          />
        )}
      });
    } else {
      patients = (
        <CardText>No patients</CardText>
      );
    }

    console.log(patients);
    const toggle_sign = (my_bool) => {return(my_bool
      ? <span style={{ 'font-size': '9px' }}>&#9650;</span>
      : <span style={{ 'font-size': '9px' }}>&#9660;</span>
    )};
    return (
      <>
        <div className="content">
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <Row>
                    <Col className="px-md-1" md="8">
                      <CardTitle tag="h4">Patients</CardTitle>
                    </Col>
                    <Col className="px-md-1" md="2">
                      <Button
                        color="secondary"
                        onClick={() => this.setState({
                          create_isOpen: !this.state.create_isOpen,
                          filter_isOpen: false
                        })}
                        >
                        Create patient
                      </Button>
                    </Col>
                    <Col className="px-md-1" md="2">
                      <Button
                        color="secondary"
                        onClick={() => this.setState({
                          create_isOpen: false,
                          filter_isOpen: !this.state.filter_isOpen
                        })}
                        >
                        Filter patients
                      </Button>
                    </Col>
                  </Row>
                  <Collapse isOpen={this.state.filter_isOpen}>
                    <Form>
                      <Row>
                        <Col className="px-md-1" md="2">
                          <FormGroup>
                            <label>
                              Nickname
                            </label>
                            <Input
                              name="name"
                              type="text"
                              onChange={(event) => {this.setState({filter_name: event.target.value})}}
                            />
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md="2">
                          <FormGroup>
                            <label>
                              Model
                            </label>
                            <Input
                              name="model"
                              type="select"
                              onChange={(event) => {this.setState({filter_machine: event.target.value})}}
                            >
                              <option key={0} value="--(All)--">--(All)--</option>
                              {models.map((val, i) => {return (
                                <option key={i+1} value={val}>{val}</option>
                              )})}
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md="2">
                          <FormGroup>
                            <label>
                              Location
                            </label>
                            <Input
                              name="location"
                              type="select"
                              onChange={(event) => {this.setState({filter_location: event.target.value})}}
                            >
                              <option key={0} value="--(All)--">--(All)--</option>
                              {locations.map((val, i) => {return (
                                <option key={i+1} value={val}>{val}</option>
                              )})}
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md="1">
                          <FormGroup>
                            <label>
                              Severity
                            </label>
                            <Input
                              name="severity"
                              type="select"
                              onChange={(event) => {this.setState({filter_severity: event.target.value})}}
                            >
                              <option key={0} value="--(All)--">--(All)--</option>
                              {this.state.severity_list.map((val, i) => {return (
                                <option key={i+1} value={i}>{val}</option>
                              )})}
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </Collapse>
                  <Collapse isOpen={this.state.create_isOpen}>
                    <Form onSubmit={this.handleSubmit}>
                      {this.renderRedirect()}
                      <Row>
                        <Col className="px-md-1" md={{ span: 3, offset: 1 }}>
                          <FormGroup>
                            <Input
                              placeholder="Nickname"
                              name="name"
                              type="text"
                            />
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md="1">
                          <FormGroup>
                            <Input type="select" name="severity">
                              {this.state.severity_list.map((val, i) => {return (
                                <option key={i+1} value={i}>{val}</option>
                              )})}
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md={{ span: 2, offset: 0 }}>
                          <Button>
                            Create
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Collapse>
                </CardHeader>
                <CardBody>
                  <Table className="tablesorter" responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Name</th>
                        <th className="text-center">Severity</th>
                        <th>Location</th>
                        <th>Machine</th>
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
