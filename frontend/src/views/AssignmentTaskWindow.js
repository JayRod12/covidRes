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
  CardTitle,
  Row,
  Col
} from "reactstrap";

class AssignmentTaskWindow extends React.Component {
  render() {
    return (
          <React.Fragment>
            {this.props.bool_install == 0 ? <th>Remove Machine</th> : <th>Install Machine</th>}
            <Row>
              <Link to={'/machine/'+this.props.machine}><th>{this.props.machine_model}</th></Link>
              <small>location: {this.props.machine_location}</small>
            </Row>
            <Row>
              <Link to={'/patient/'+this.props.patient}><th>{this.props.patient_name}</th></Link>
              <small>location: {this.props.patient_location}</small>
            </Row>
            <Row>
              <Col className="px-md-1" md="4" align="right">
                <Button

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
