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

import {
  withLocalize,
  Translate,
  LocalizeContext,
  LocalizeProvider
} from 'react-localize-redux';
import { renderToStaticMarkup } from 'react-dom/server';

import languages from "src/translations/languages.json"
var lang = {}
languages.forEach((language, i) => {
  const common = require('src/translations/' + language.code + '/common.json')
  const local = require('src/translations/' + language.code + '/adminview.json')
  lang[language.code] = Object.assign({}, common, local)
});

import common_en from "src/translations/en/common.json"
import adminview_en from "src/translations/en/adminview.json"
const en = Object.assign({}, common_en, adminview_en)

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
      data_locations: [],
      loaded_locations: false,
      placeholder_locations: "Loading",
      error_locations: "",
      redirect: null,
      create_isOpen: false,
      filter_isOpen: false,
      selected_tab: "Models",
      filter_username: "--(All)--",
      filter_first_name: "--(All)--",
      filter_last_name: "--(All)--",
      filter_role: "--(All)--"
    };

    languages.forEach((language, i) => {
      props.addTranslationForLanguage(lang[language.code], language.code);
    });


    this.handleRoleSubmit = this.handleRoleSubmit.bind(this);
    this.handleModelSubmit = this.handleModelSubmit.bind(this);
    this.handleLocationSubmit = this.handleLocationSubmit.bind(this);
    this.handleUserSubmit = this.handleUserSubmit.bind(this);
  }
  handleRoleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    console.log("ROLE DATA: ", data)

    fetch('/rest/roles/', {
      method: 'POST',
      body: JSON.stringify({
          name: data.get('name')
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {return response.json()}).then(data => {
      this.setState({redirect: '/role/'+data.id})
    })
  }
  handleModelSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    console.log("MODEL NAME", data.get('name'));

    fetch('/rest/machinetypes/', {
      method: 'POST',
      body: JSON.stringify({
          name: data.get('name')
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {return response.json()}).then(data => {
      var new_data_models = this.state.data_models
      new_data_models = [...new_data_models, data]
      this.setState({data_models: new_data_models})
    })
  }
  handleLocationSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    console.log("LOCATION NAME", data.get('name'));

    fetch('/rest/locations/', {
      method: 'POST',
      body: JSON.stringify({
          name: data.get('name')
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {return response.json()}).then(data => {
      var new_data_locations = this.state.data_locations
      new_data_locations = [...new_data_locations, data]
      this.setState({data_locations: new_data_locations})
    })
  }
  handleUserSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    fetch('/rest/users/', {
      method: 'POST',
      body: JSON.stringify({
          username: data.get('username')
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {return response.json()}).then(data => {
      this.setState({redirect: '/user/'+data.pk})
    })
  }
  renderRedirect = () => {
    if (this.state.redirect != null) {
      return (<Redirect to={this.state.redirect} />)
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
    fetch("rest/locations/")
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
            data_locations: data,
            loaded_locations: true
          };
        });
      })
      .catch(error => {
        this.setState(() => {
          return {
            loaded_locations: true,
            placeholder_locations: "Failed to load",
            error_locations: "You don't have permission to view these locations.",
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
    const t = this.props.translate
    if (!(this.state.loaded_roles && this.state.loaded_models && this.state.loaded_locations && this.state.loaded_users)) {
      return (
        <CardHeader>
          <CardTitle tag="h4">{t("Loading roles")}...</CardTitle>
        </CardHeader>
      );
    }
    const results_roles = this.state.data_roles ? this.state.data_roles : [];
    const results_models = this.state.data_models ? this.state.data_models : [];
    const results_locations = this.state.data_locations ? this.state.data_locations : [];
    const results_users = this.state.data_users ? this.state.data_users : [];

    return (
      <>
        <div className="content">
          <Row>
            <Col lg="8">
              <Card className="card-chart">
                <CardHeader>
                  <Row>
                    <Col className="text-left" md="6">
                      <CardTitle tag="h4">{t("Users")}</CardTitle>
                    </Col>
                    <Col className="px-md-1" md="3">
                      <Button
                        color="secondary"
                        onClick={() => this.setState({
                          create_isOpen: false,
                          filter_isOpen: !this.state.filter_isOpen
                        })}
                        >
                        {t("Filter users")}
                      </Button>
                    </Col>
                    {this.props.me && this.props.me.permission_patient_edit && (
                      <Col className="px-md-1" md="3">
                        <Button
                          color="secondary"
                          onClick={() => this.setState({
                            create_isOpen: !this.state.create_isOpen,
                            filter_isOpen: false
                          })}
                          >
                          {t("Create user")}
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
                              {t("Username")}
                            </label>
                            <Input
                              name="username"
                              type="text"
                              onChange={(event) => {this.setState({filter_username: event.target.value})}}
                            />
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md="2">
                          <FormGroup>
                            <label>
                              {t("First name")}
                            </label>
                            <Input
                              name="first_name"
                              type="text"
                              onChange={(event) => {this.setState({filter_first_name: event.target.value})}}
                            />
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md="2">
                          <FormGroup>
                            <label>
                              {t("Last name")}
                            </label>
                            <Input
                              name="last_name"
                              type="text"
                              onChange={(event) => {this.setState({filter_last_name: event.target.value})}}
                            />
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md="2">
                          <FormGroup>
                            <label>
                              {t("Role")}
                            </label>
                            <Input
                              name="location"
                              type="select"
                              onChange={(event) => {this.setState({filter_role: event.target.value})}}
                            >
                              <option key={0} value="--(All)--">--(All)--</option>
                              {results_roles.map((val, i) => {return (
                                <option key={i+1} value={val.id}>{val.name}</option>
                              )})}
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </Collapse>
                  <Collapse isOpen={this.state.create_isOpen}>
                    <Form onSubmit={this.handleUserSubmit}>
                      {this.renderRedirect()}
                      <Row>
                        <Col className="px-md-1" md={{ span: 3, offset: 1 }}>
                          <FormGroup>
                            <Input
                              placeholder={t("Username")}
                              name="username"
                              type="text"
                            />
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md={{ span: 2, offset: 0 }}>
                          <Button>
                            {t("Create")}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Collapse>
                </CardHeader>
                <CardBody>
                  <div style={{maxHeight: "400px", overflow: "auto"}}>
                    <Table className="tablesorter" responsive>
                      <thead className="text-primary">
                        <tr>
                          <th>{t("Username")}</th>
                          <th>{t("First name")}</th>
                          <th>{t("Last name")}</th>
                          <th>{t("Role")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results_users.filter(item => (
                          (this.state.filter_role == "--(All)--" || this.state.filter_role == item.role) &&
                          (this.state.filter_username == "--(All)--" || this.state.filter_username.length <= item.username.length && this.state.filter_username.toLowerCase() == item.username.substring(0, this.state.filter_username.length).toLowerCase()) &&
                          (this.state.filter_first_name == "--(All)--" || this.state.filter_first_name.length <= item.first_name.length && this.state.filter_first_name.toLowerCase() == item.first_name.substring(0, this.state.filter_first_name.length).toLowerCase()) &&
                          (this.state.filter_last_name == "--(All)--" || this.state.filter_last_name.length <= item.last_name.length && this.state.filter_last_name.toLowerCase() == item.last_name.substring(0, this.state.filter_last_name.length).toLowerCase())
                        )).map((item, ii) => {return(
                          <tr>
                            <td><Link to={'/user/' + item.pk}>{item.username}</Link></td>
                            <td>{item.first_name}</td>
                            <td>{item.last_name}</td>
                            <td>{item.role_name}</td>
                          </tr>
                        )})}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4">
              <Card className="card-chart">
                <CardHeader>
                  <CardTitle tag="h4">
                    <Link onClick={() => {this.setState({selected_tab: "Roles"})}}>{t("Roles")}</Link>/
                    <Link onClick={() => {this.setState({selected_tab: "Models"})}}>{t("Models")}</Link>/
                    <Link onClick={() => {this.setState({selected_tab: "Locations"})}}>{t("Locations")}</Link>
                  </CardTitle>
                </CardHeader>
                { this.state.selected_tab == "Roles" && (
                  <CardBody>
                    { true && (//this.props.me && this.props.me.permission_role_edit && (
                      <Col className="px-md-1" md="5">
                        <Form onSubmit={this.handleRoleSubmit}>
                          <Row>
                            <Col className="text-left" md="8">
                              <FormGroup>
                                <Input
                                  placeholder={t("Role name")}
                                  name="name"
                                  type="text"
                                />
                              </FormGroup>
                            </Col>
                            <Col className="px-md-1" md="2">
                              <Button>
                                {t("Create")}
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </Col>
                    )}
                    <div style={{maxHeight: "400px", overflow: "auto"}}>
                      <Table className="tablesorter" responsive>
                        <thead className="text-primary">
                          <tr>
                            <th>{t("Role name")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results_roles.map((item, ii) => {return(
                            <tr>
                              <td><Link to={'/role/' + item.id}>{item.name}</Link></td>
                            </tr>
                          )})}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                )}
                { this.state.selected_tab == "Models" && (
                  <CardBody>
                    { true && (//this.props.me && this.props.me.permission_role_edit && (
                      <Col className="px-md-1" md="5">
                        <Form onSubmit={this.handleModelSubmit}>
                          <Row>
                            <Col className="text-left" md="8">
                              <FormGroup>
                                <Input
                                  placeholder={t("Model name")}
                                  name="name"
                                  type="text"
                                />
                              </FormGroup>
                            </Col>
                            <Col className="px-md-1" md="2">
                              <Button>
                                {t("Create")}
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </Col>
                    )}
                    <div style={{maxHeight: "400px", overflow: "auto"}}>
                      <Table className="tablesorter" responsive>
                        <thead className="text-primary">
                          <tr>
                            <th>{t("Model name")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results_models.map((item, ii) => {return(
                            <tr>
                              <td>{item.name}</td>
                            </tr>
                          )})}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                )}
                { this.state.selected_tab == "Locations" && (
                  <CardBody>
                    { true && (//this.props.me && this.props.me.permission_role_edit && (
                      <Col className="px-md-1" md="5">
                        <Form onSubmit={this.handleLocationSubmit}>
                          <Row>
                            <Col className="text-left" md="8">
                              <FormGroup>
                                <Input
                                  placeholder={t("Location name")}
                                  name="name"
                                  type="text"
                                />
                              </FormGroup>
                            </Col>
                            <Col className="px-md-1" md="2">
                              <Button>
                                {t("Create")}
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </Col>
                    )}
                    <div style={{maxHeight: "400px", overflow: "auto"}}>
                      <Table className="tablesorter" responsive>
                        <thead className="text-primary">
                          <tr>
                            <th>{t("Location name")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results_locations.map((item, ii) => {return(
                            <tr>
                              <td>{item.name}</td>
                            </tr>
                          )})}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default withLocalize(AdminView);
