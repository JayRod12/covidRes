import React from "react";
import { NavLink, Link } from "react-router-dom";
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
  CardFooter,
  CardText,
  CardTitle,
  Row,
  Col
} from "reactstrap";

import $ from 'jquery';

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

class AssignmentTaskWindow extends React.Component {
  _commit = (props) => {
      fetch('rest/assignment_tasks/' + props.pk + "/", {
          method: 'PATCH',
          body: JSON.stringify({
              bool_completed: props.bool_install,
              bool_install: 1
          }),
          headers: {
              "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
          }
      }).then(response => {
          return response.json();
      }).then(json => {
          // optimistically update the state with the new item
          this.setState(prevState => {
              return {
                  ...prevState,
                  items: prevState.items.map(item =>
                      item.id === json.pk
                          ? Object.assign({}, item, {
                              start_time: moment(json.start_date).valueOf(),
                              end_time: moment(json.end_date).valueOf(),
                              group: json.machine
                          })
                          : item
                  ),
                  pendingItemMove: null,
              };
          })
      }).catch(error => {
          console.log("Something bad happened while trying to edit the current machine assignment." + error);
      });
  }
  render() {
    return (
          <React.Fragment>
            {this.props.bool_install == 1 ? <h3>Remove Machine</h3> : <h3>Install Machine</h3>}
            <div align="right">Due: {this.props.date}</div>
            <hr/>
            <Row>
              <Link to={'/machine/'+this.props.machine}><h4>{this.props.machine_model}</h4></Link> #{this.props.machine}
            </Row>
            <Row>
              <small>location: {this.props.machine_location}</small>
            </Row>
            <hr/>
            <Row>
              <Link to={'/patient/'+this.props.patient}><h4>{this.props.patient_name}</h4></Link> #{this.props.patient}
            </Row>
            <Row>
              <small>location: {this.props.patient_location}</small>
            </Row>
            <Row>
              <Col className="px-md-1" md={{ span: 6, offset: 3 }}>
                <Button
                  block
                  onClick={() => this._commit(this.props)}
                >
                Complete task
                </Button>
              </Col>
            </Row>
          </React.Fragment>
    );
  }
}

export default AssignmentTaskWindow
