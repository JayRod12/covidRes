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

class AdminView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data_roles: [],
      loaded_roles: false,
      placeholder_roles: "Loading",
      error_roles: "",
      data_models: [],
      loaded_models: false,
      placeholder_models: "Loading",
      error_models: "",
      redirect: 0,
      createRole_isOpen: false,
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
    fetch("rest/roles/")
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
            data_roles: data,
            loaded_roles: true
          };
        });
      })
      .catch(error => {
        this.setState(() => {
          return {
            loaded_roles: true,
            placeholder_roles: "Failed to load",
            error_roles: "You don't have permission to view these roles.",
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
            data_models: data,
            loaded_models: true
          };
        });
      })
      .catch(error => {
        this.setState(() => {
          return {
            loaded_models: true,
            placeholder_models: "Failed to load",
            error_models: "You don't have permission to view these models.",
          };
        });
      });
    fetch("rest/users/")
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
            data_users: data,
            loaded_users: true
          };
        });
      })
      .catch(error => {
        this.setState(() => {
          return {
            loaded_users: true,
            placeholder_users: "Failed to load",
            error_users: "You don't have permission to view these models.",
          };
        });
      });
  };
  render() {
    if (!(this.state.loaded_roles && this.state.loaded_models && this.state.loaded_users)) {
      return (
        <CardHeader>
          <CardTitle tag="h4">Loading roles...</CardTitle>
        </CardHeader>
      );
    }
    const results_roles = IS_DEV ? this.state.data_roles.results : this.state.data_roles;
    const results_models = IS_DEV ? this.state.data_models.results : this.state.data_models;
    const results_users = IS_DEV ? this.state.data_users.results : this.state.data_users;

    console.log("Roles: ", results_roles)
    console.log("Models: ", results_models)
    console.log("Users: ", results_users)

    return (
      <>
        <div className="content">
          <Row>
            <Col lg="6">
              <Card className="card-chart">
                <CardHeader>
                  <Row>
                    <Col className="px-md-1" md="2">
                      <CardTitle tag="h4">Roles</CardTitle>
                    </Col>
                    { true && (//this.props.me && this.props.me.permission_role_edit && (
                      <Col className="px-md-1" md="5">
                        <Form>
                          <Row>
                            <Col className="px-md-1" md="8">
                              <FormGroup>
                                <Input
                                  placeholder="Role name"
                                  name="name"
                                  type="text"
                                />
                              </FormGroup>
                            </Col>
                            <Col className="px-md-1" md="2">
                              <Button>
                                Create
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </Col>
                    )}
                  </Row>
                </CardHeader>
                <CardBody>
                  <Table className="tablesorter" responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Role name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results_roles.map((item, ii) => {return(
                        <tr>
                          <td><Link to={'/role/' + item.pk}>{item.name}</Link></td>
                        </tr>
                      )})}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
            <Col lg="6">
              <Card className="card-chart">
                <CardHeader>
                  <Row>
                    <Col className="px-md-1" md="2">
                      <CardTitle tag="h4">Models</CardTitle>
                    </Col>
                    { true && (//this.props.me && this.props.me.permission_role_edit && (
                      <Col className="px-md-1" md="5">
                        <Form>
                          <Row>
                            <Col className="px-md-1" md="8">
                              <FormGroup>
                                <Input
                                  placeholder="Model name"
                                  name="name"
                                  type="text"
                                />
                              </FormGroup>
                            </Col>
                            <Col className="px-md-1" md="2">
                              <Button>
                                Create
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </Col>
                    )}
                  </Row>
                </CardHeader>
                <CardBody>
                  <Table className="tablesorter" responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Model name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results_models.map((item, ii) => {return(
                        <tr>
                          <td><Link to={'/model/' + item.pk}>{item.name}</Link></td>
                        </tr>
                      )})}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <Card className="card-chart">
                <CardHeader>
                  <Row>
                    <Col className="px-md-1" md="2">
                      <CardTitle tag="h4">Users</CardTitle>
                    </Col>
                    { this.props.me && this.props.me.permission_role_edit && (
                      <Col className="px-md-1" md="12">
                        <Form>
                          <Row>
                            <Col className="px-md-1" md="8">
                              <FormGroup>
                                <Input
                                  placeholder="Username"
                                  name="username"
                                  type="text"
                                />
                              </FormGroup>
                            </Col>
                            <Col className="px-md-1" md="8">
                              <FormGroup>
                                <Input
                                  placeholder="Role"
                                  name="role"
                                  type="select"
                                >
                                {results_roles.map((item, ii) => {return(
                                  <option key={ii} value={item.pk}>{item.name}</option>
                                )})}
                                </Input>
                              </FormGroup>
                            </Col>
                            <Col className="px-md-1" md="2">
                              <Button>
                                Create
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </Col>
                    )}
                  </Row>
                </CardHeader>
                <CardBody>
                  <Table className="tablesorter" responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Username</th>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results_users.map((item, ii) => {return(
                        <tr>
                          <td><Link to={'/user/' + item.pk}>{item.username}</Link></td>
                          <td>{item.first_name}</td>
                          <td>{item.last_name}</td>
                          <td>{item.role_name}</td>
                        </tr>
                      )})}
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

export default AdminView;