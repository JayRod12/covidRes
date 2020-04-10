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

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
  const local = require('src/translations/' + language.code + '/tasklist.json')
  lang[language.code] = Object.assign({}, common, local)
});

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

class TaskList extends React.Component {
  constructor(props) {
    super(props);

    languages.forEach((language, i) => {
      props.addTranslationForLanguage(lang[language.code], language.code);
    });

    this.state = {
      data: [],
      loaded: false,
      placeholder: "Loading",
      error_message: "",
      redirect: 0,
      filter_isOpen: false,
      filter_patient: "",
      filter_machine: "--(All)--",
      filter_machine_location: "--(All)--",
      filter_patient_location: "--(All)--",
      showDialog: false,
      selectedTask: null,
    };
  }
  _commit = () => {
      fetch('/rest/assignment_tasks/' + this.state.selectedTask.pk + "/", {
          method: 'PATCH',
          body: JSON.stringify({
              bool_completed: this.state.selectedTask.bool_install,
              bool_install: true
          }),
          headers: {
              "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
          }
      }).then(response => {
        if (response.status > 400) {
          throw new Error(response.status);
        }
        return response.json();
      }).then(data => {window.location.reload()})
  }
  componentDidMount() {
    fetch("/rest/assignment_tasks/query/bool_completed=0/")
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
    const t = this.props.translate
    if (!this.state.loaded) {
      return (
        <CardHeader>
          <CardTitle tag="h4">{t("Loading tasks")}...</CardTitle>
        </CardHeader>
      );
    }
    let tasks;
    const results = this.state.data;

    var models = []
    var patient_locations = []
    var machine_locations = []

    if (this.state.error_message.length > 0) {
      tasks = (
        <Alert color="danger">
          {this.state.error_message} Are you <a href="/admin" className="alert-link"> logged in?</a>
        </Alert>
      );
    } else if (results.length > 0) {
      models = [...new Set(results.map(task => task.machine_model))]
      patient_locations = [...new Set(results.map(task => task.patient_location))]
      machine_locations = [...new Set(results.map(task => task.machine_location))]
      models.sort()
      patient_locations.sort()
      machine_locations.sort()
      tasks = results.map((entry, index) => {
        if (
          (this.state.filter_machine_location == "--(All)--" || this.state.filter_machine_location == entry.machine_location) &&
          (this.state.filter_machine == "--(All)--" || this.state.filter_machine == entry.machine_model || this.state.filter_machine == "" && entry.machin_assigned_model == null) &&
          (this.state.filter_patient_location == "--(All)--" || this.state.filter_patient_location == entry.patient_location) &&
          (this.state.filter_patient.length == 0 || this.state.filter_patient.length <= entry.patient_name.length && this.state.filter_patient.toLowerCase() == entry.patient_name.substring(0, this.state.filter_patient.length).toLowerCase())
        ) {return (
          <tr>
            <td><Link onClick={() => {this.setState({showDialog: true, selectedTask: entry})}}>{entry.bool_install ? t("Remove") : t("Install")}</Link></td>
            <td><Link to={'/patient/'+entry.patient}>{entry.patient_name}</Link></td>
            <td><Link to={'/machine/'+entry.machine}>{entry.machine_model}</Link></td>
            <td>{entry.patient_location}</td>
            <td>{entry.machine_location}</td>
            <td>{moment(entry.date).format("HH:mm (DD-MMM-YYYY)")}</td>
          </tr>
        )}
      });
    } else {
      tasks = (
        <CardText>{t("No tasks")}</CardText>
      );
    }

    console.log(this.state.showDialog);
    const toggle_sign = (my_bool) => {return(my_bool
      ? <span style={{ 'font-size': '9px' }}>&#9650;</span>
      : <span style={{ 'font-size': '9px' }}>&#9660;</span>
    )};
    return (
      <>
        <div className="content">
          <Row>
            {this.state.selectedTask && (
              <Dialog
                  open={this.state.showDialog}
                  onClose={() => this._closeDialog(false)}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
              >
              <DialogTitle id="alert-dialog-title">
                <h3 align="center">{this.state.selectedTask.bool_install ? t("Remove") : t("Install")}</h3>
                <h5 align="center">{moment(this.state.selectedTask.date).format("HH:mm (DD-MMM-YYYY)")}</h5>
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  <Row>
                    <Col md="5">
                      <h4 align="center"><Link to={'/patient/'+this.state.selectedTask.patient}>{this.state.selectedTask.patient_name}</Link></h4>
                    </Col>
                    <Col md="2">
                      {" => "}
                    </Col>
                    <Col md="5">
                      <h4 align="center"><Link to={'/machine/'+this.state.selectedTask.machine}>{this.state.selectedTask.machine_model}</Link></h4>
                    </Col>
                  </Row>
                  <Col md="12">
                   {t("By pressing Ok you confirm that you realized the task.")}
                  </Col>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {this.setState({showDialog: false})}} color="primary">
                  {t("Cancel")}
                </Button>
                <Button onClick={this._commit} color="primary">
                  {t("Ok")}
                </Button>
              </DialogActions>
              </Dialog>
            )}
            <Col md="12">
              <Card>
                <CardHeader>
                  <Row>
                    <Col className="px-md-12" md="8">
                      <CardTitle tag="h3">{t("Tasks")}</CardTitle>
                    </Col>
                    <Col  className="text-right" md="4" >
                      <Button
                        color="secondary"
                        onClick={() => this.setState({
                          filter_isOpen: !this.state.filter_isOpen
                        })}
                        >
                        {t("Filter tasks")}
                      </Button>
                    </Col>
                  </Row>
                  <Collapse isOpen={this.state.filter_isOpen}>
                    <Form>
                      <Row>
                        <Col className="text-left" md="2">
                          <FormGroup>
                            <label>
                              {t("Patient name")}
                            </label>
                            <Input
                              name="name"
                              type="text"
                              onChange={(event) => {this.setState({filter_patient: event.target.value})}}
                            />
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md="2">
                          <FormGroup>
                            <label>
                              {t("Model")}
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
                              {t("Patient location")}
                            </label>
                            <Input
                              name="patient_location"
                              type="select"
                              onChange={(event) => {this.setState({filter_patient_location: event.target.value})}}
                            >
                              <option key={0} value="--(All)--">--(All)--</option>
                              {patient_locations.map((val, i) => {return (
                                <option key={i+1} value={val}>{val}</option>
                              )})}
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col className="px-md-1" md="2">
                          <FormGroup>
                            <label>
                              {t("Machine location")}
                            </label>
                            <Input
                              name="machine_location"
                              type="select"
                              onChange={(event) => {this.setState({filter_machine_location: event.target.value})}}
                            >
                              <option key={0} value="--(All)--">--(All)--</option>
                              {machine_locations.map((val, i) => {return (
                                <option key={i+1} value={val}>{val}</option>
                              )})}
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </Collapse>
                </CardHeader>
                <CardBody>
                  <div style={{maxHeight: "400px", overflow: "auto"}}>
                    <Table className="tablesorter" >
                      <thead className="text-primary">
                        <tr>
                          <th>{t("Task")}</th>
                          <th>{t("Patient name")}</th>
                          <th>{t("Machine model")}</th>
                          <th>{t("Patient location")}</th>
                          <th>{t("Machine location")}</th>
                          <th>{t("Date")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default withLocalize(TaskList);
