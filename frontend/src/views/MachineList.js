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

class MachineRow extends React.Component {
  render() {
    return (
      <React.Fragment>
        <tr>
          <td><Link to={'/machine/' + this.props.pk}>{this.props.model_name}</Link></td>
          <td>{this.props.location}</td>
          <td>{this.props.patient_assigned_name}</td>
        </tr>
      </React.Fragment>
    );
  }
}
function prettifyDate(raw_date) {
  return new Date(raw_date).toGMTString();
};

class MachineList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      data_machinetype: [],
      loaded: false,
      loaded_machinetype: false,
      placeholder: "Loading",
      error_message: "",
      redirect: 0,
      create_isOpen: false,
      filter_isOpen: false,
      filter_availability: "--(All)--",
      filter_machine: "--(All)--",
      filter_location: "--(All)--"
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    fetch('/rest/machines/', {
      method: 'POST',
      body: JSON.stringify({
          model: data.get('model')
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
      return (<Redirect to={'/machine/'+this.state.redirect} />)
    }
  }
  componentDidMount() {
    fetch("rest/machines/")
      .then(response => {
        if (response.status > 400) {
          throw new Error(response.status);
        }
        return response.json();
      })
      .then(data => {
        var results = data;
        results = results.sort((a, b) => a.location.localeCompare(b.location))
        this.setState(() => {
          return {
            data: results,
            loaded: true
          };
        });
      })
      .catch(error => {
        this.setState(() => {
          return {
            loaded: true,
            placeholder: "Failed to load",
            error_message: "You don't have permission to view these machines.",
          };
        });
      });
      fetch("rest/machinetypes/")
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
              loaded_machinetype: true,
              data_machinetype: data,
            };
          });
        })
        .catch(error => {
          this.setState(() => {
            return {
              loaded_machinetype: true,
              placeholder: "Failed to load",
              error_message: this.state.error_message + " You don't have permission to view these machines.",
            };
          });
        });
  };
  render() {
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">Loading machines...</CardTitle>
        </CardHeader>
      );
    }
    if (!this.state.loaded_machinetype) {
      return (
        <CardHeader>
          <CardTitle tag="h4">Loading machinetypes...</CardTitle>
        </CardHeader>
      );
    }
    let machines;

    var models = []
    var locations = []

    if (this.state.error_message.length > 0) {
      machines = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (this.state.data.length > 0) {
      models = [...new Set(this.state.data.map(machine => machine.model_name))]
      locations = [...new Set(this.state.data.map(machine => machine.location))]
      machines = this.state.data.map((entry, index) => {
        if (
          (this.state.filter_availability == "--(All)--" || this.state.filter_availability == (entry.patient_assigned != null)) &&
          (this.state.filter_machine == "--(All)--" || this.state.filter_machine == entry.model_name) &&
          (this.state.filter_location == "--(All)--" || this.state.filter_location == entry.location)
        ) {return(
        <MachineRow
          key={entry.pk}
          pk={entry.pk}
          model_name={entry.model_name}
          location={entry.location}
          patient_assigned_name={entry.patient_assigned_name}
        />
      )}
      });
    } else {
      machines = (
        <CardText>No machines</CardText>
      );
    }
    let machinetypes;
    const results_machinetype = this.state.data_machinetype;
    if (this.state.error_message.length > 0) {
      machinetypes = (
        <div></div>
      );
    } else {
      machinetypes = results_machinetype.map((entry, index) => (
        <option key={entry.pk} value={entry.pk}>{entry.name}</option>
      )
      );
    }
    console.log(machines);
    return (
      <>
      {this.renderRedirect()}
        <div className="content">
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>
                  <Row>
                    <Col className="px-md-12" md="8">
                      <CardTitle tag="h3">Machines</CardTitle>
                    </Col>
                    <Col className="px-md-1" md="2">
                      <Button
                        color="secondary"
                        onClick={() => this.setState({
                          create_isOpen: false,
                          filter_isOpen: !this.state.filter_isOpen
                        })}
                        >
                        Filter machines
                      </Button>
                    </Col>
                    {this.props.me && this.props.me.permission_machine_edit && (
                      <Col className="px-md-1" md="2">
                        <Button
                          color="secondary"
                          onClick={() => this.setState({
                            create_isOpen: !this.state.create_isOpen,
                            filter_isOpen: false
                          })}
                          >
                          Create machine
                        </Button>
                      </Col>
                    )}
                  </Row>
                  <Collapse isOpen={this.state.filter_isOpen}>
                    <Form>
                      <Row>
                        <Col className="text-left" md="2">
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
                              Available?
                            </label>
                            <Input
                              name="severity"
                              type="select"
                              onChange={(event) => {this.setState({filter_availability: event.target.value})}}
                            >
                              <option key={0} value="--(All)--">--(All)--</option>
                              <option key={1} value={1}>No</option>
                              <option key={2} value={0}>Yes</option>
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
                        <Col className="px-md-1" md={{ span: 2, offset: 2 }}>
                          <FormGroup>
                            <Input type="select" name="model">
                              {machinetypes}
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
                        <th>Location</th>
                        <th>Patient</th>
                      </tr>
                    </thead>
                    <tbody>
                      {machines}
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

export default MachineList;
