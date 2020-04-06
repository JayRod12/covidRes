import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import Select from '@material-ui/core/Select';

import Timeline, {
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
    TimelineMarkers,
    TodayMarker,
} from 'src/react-calendar-timeline'

import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    CardText,
    CardTitle,
    Collapse,
    FormGroup,
    Form,
    Input,
    Row,
    Table,
    Col,
    DropdownList
} from "reactstrap";

// make sure you include the timeline stylesheet or the timeline will not be styled
import 'src/react-calendar-timeline/src/lib/Timeline.scss'
import "react-datepicker/dist/react-datepicker.css";

import moment from 'moment'

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import DatePicker from "react-datepicker";

import $ from 'jquery';

const FIVE_SECONDS_MS = 5 * 1000;
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
          <td><Link onClick={this.props.onClick}>{this.props.name}</Link></td>
          <td className="text-center">{this.props.severity}</td>
          <td>{this.props.location}</td>
          <td>{this.props.machine_assigned_model}</td>
          <td>{moment(this.props.admission_date).format("HH:mm (DD-MMM-YYYY)")}</td>
        </tr>
      </React.Fragment>
    );
  }
}


class Ventilators extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            groups: [],
            items: null,
            dialogState: { showDialog: false, dialogTitle: "", dialogText: "", showCancelButton: false },
            pendingItemMove: null,
            pendingItemResize: null,
            selected: [],
            data_patients: [],
            allPatients: null,
            allMachines: null,
            selectedPatient: -1,
            selectedMachine: -1,
            selectedStartDate: null,
            selectedEndDate: null,
            selectedItem: null,
            severity_list: ["Healed", "Low", "Moderate", "Medium", "High", "Very high", "Dead"],
            create_isOpen: false,
            filter_isOpen: false,
            filter_machine: "--(All)--",
            filter_location: "--(All)--",
            filter_follow: false,
            filterc_name: "",
            filterc_severity: "--(All)--",
            filterc_machine: "--(All)--",
            filterc_location: "--(All)--"
        };
    }
    groups_filtered = [];
    componentDidMount() {
        // we need to fetch patients, machines and assignemnts

        fetch("/rest/patients/")
            .then(response => {
                if (response.status > 400) {
                    throw new Error(response.status);
                }
                return response.json();
            })
            .then(data => {
                const results = data;
                const allPatients = results.map(patient => { return { id: patient.pk, name: patient.name } });
                this.setState(prevState => ({
                    ...prevState, allPatients: allPatients, data_patients: data
                }));
            })
            .catch(error => {
                console.log("Something bad happened while trying to fetch patient data :( " + error);
            });


        var ventilatorPromise = fetch("rest/machines/")
            .then(response => {
                if (response.status > 400) {
                    throw new Error(response.status);
                }
                return response.json();
            })
            .then(data => {
                const results = data;
                const groups = []; const allMachines = [];
                results.forEach(ventilator => {
                    //const ventilatorName = ventilator.model_name + " #" + ventilator.pk + " (" + ventilator.location + ")";
                    const ventilatorName = (<><Link to={'/machine/' + ventilator.pk}>{ventilator.model_name}</Link> - {ventilator.location}</>)
                    groups.push({ id: ventilator.pk, title: ventilatorName, machine_model: ventilator.model_name, machine_location: ventilator.location});
                    allMachines.push({ id: ventilator.pk, name: ventilatorName, machine_model: ventilator.model_name, machine_location: ventilator.location})
                });
                this.setState(prevState => ({
                    ...prevState, groups: groups, allMachines: allMachines
                }));
            })
            .catch(error => {
                console.log("Something bad happened while trying to fetch ventilator data :( " + error);
            });

        ventilatorPromise.then(() =>
            fetch("rest/assignment_tasks/")
                .then(response => {
                    if (response.status > 400) {
                        throw new Error(response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    const results = data;
                    const items = [];
                    results.forEach(assignment => {
                        items.push({
                            id: assignment.pk,
                            group: assignment.machine,
                            title: assignment.patient_name,
                            start_time: moment(assignment.start_date).valueOf(),
                            end_time: moment(assignment.end_date).valueOf(),
                            canChangeGroup: true,
                            patient_id: assignment.patient,
                            machine_location: assignment.machine_location,
                            machine_model: assignment.machine_model,
                            canMove: this.props.me && this.props.me.permission_task_edit && assignment.bool_install == 0,
                            canResize: this.props.me && this.props.me.permission_task_edit ? (assignment.bool_install == 0 ? "both" : assignment.bool_completed ? false : "right") : false,
                        });
                    });
                    this.setState(prevState => ({
                        ...prevState, items: items
                    }));
                })
                .catch(error => {
                    console.log("Something bad happened while trying to fetch assignemnt data :( " + error);
                }));
    }

    _handleItemMove = (itemId, dragTime, newGroupOrder) => {
        // local validation before trying to do anything
        const selectedItem = this.state.items.find(item => item.id === itemId);
        const newStartTime = dragTime;
        const newEndTime = dragTime + (selectedItem.end_time - selectedItem.start_time);
        const newMachine = this.groups_filtered[newGroupOrder];

        if (selectedItem.group > 0 || newGroupOrder > 0) {
          const isValidOperation = this._isValidOperation(itemId, newStartTime, newEndTime, selectedItem.patient_id, newMachine.id);
          if (!isValidOperation && newGroupOrder > 0) {
              this._showMachineOrPatientAssignedDialog();
              return;
          }

          this.setState(prevState => ({
              ...prevState,
              dialogState: {
                  showDialog: true,
                  dialogTitle: "Move ventilator?",
                  dialogText: "You are about to change the assignment of this ventilator. Please confirm.",
                  showCancelButton: true,
              },
              pendingItemMove: { itemId: itemId, dragTime: dragTime, newGroupOrder: newGroupOrder }
          }));
        } else {
          this.setState({pendingItemMove: { itemId: itemId, dragTime: dragTime, newGroupOrder: newGroupOrder }})
          this._applyPendingChanges()
        }
    }

    _handleItemResize = (itemId, time, edge) => {
        // local validation before trying to do anything
        const selectedItem = this.state.items.find(item => item.id === itemId);
        const newStartTime = edge === "left" ? time : selectedItem.start_time;
        const newEndTime = edge === "left" ? selectedItem.end_time : time;

        if (selectedItem.group > 0) {
          const isValidOperation = this._isValidOperation(itemId, newStartTime, newEndTime, selectedItem.patient_id, selectedItem.group);
          if (!isValidOperation) {
              this._showMachineOrPatientAssignedDialog();
              return;
          }

          this.setState(prevState => ({
              ...prevState,
              dialogState: {
                  showDialog: true,
                  dialogTitle: "Edit ventilator assignment?",
                  dialogText: "You are about to change the assignment of this ventilator. Please confirm.",
                  showCancelButton: true,
              },
              pendingItemResize: { itemId: itemId, time: time, edge: edge }
          }));
        } else {
          this.setState({pendingItemResize: { itemId: itemId, time: time, edge: edge}})
          this._applyPendingChanges()
        }
    }

    _applyPendingChanges = () => {
      console.log("pendingItemMove", this.state.pendingItemMove);
      console.log("pendingItemResize", this.state.pendingItemResize);
        if (this.state.pendingItemMove !== null) {
            const { items } = this.state;
            const { itemId, dragTime, newGroupOrder } = this.state.pendingItemMove;
            const group = this.groups_filtered[newGroupOrder];
            const selectedItem = items.find(item => item.id === itemId);

            this._actuallyCommitPendingChange(
                itemId,
                selectedItem.patient_id,
                group.id,
                dragTime,
                dragTime + (selectedItem.end_time - selectedItem.start_time));
            return
        }

        if (this.state.pendingItemResize !== null) {
            const { items } = this.state;
            const { itemId, time, edge } = this.state.pendingItemResize;
            const selectedItem = items.find(item => item.id === itemId);

            this._actuallyCommitPendingChange(
                itemId,
                selectedItem.patient_id,
                selectedItem.group,
                edge === "left" ? time : selectedItem.start_time,
                edge === "left" ? selectedItem.end_time : time);
        }
    }

    _actuallyCommitPendingChange = (assignmentID, patient, machine, start_date, end_date) => {
      const old_machine = this.state.items.find(item => item.id === assignmentID).group
      if (machine > 0) {
        const method = old_machine > 0 ? 'PATCH' : 'POST';
        const url = old_machine > 0 ? 'rest/assignment_tasks/' + assignmentID + "/" : 'rest/assignment_tasks/';
        fetch(url, {
            method: method,
            body: JSON.stringify({
                patient: patient,
                machine: machine,
                start_date: new Date(start_date).toISOString(),
                end_date: new Date(end_date).toISOString(),
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
            }
        }).then(response => {
          console.log("RESPONSE", response)
            return response.json();
        }).then(json => {
          console.log("JSON", json)
          console.log("ITEMS", this.state.items)
          console.log("assignmentID", assignmentID)
          // optimistically update the state with the new item
          if (old_machine > 0) {
            this.setState(prevState => {
              return {
                ...prevState,
                items: prevState.items.map(item =>
                  (item.id === json.pk
                    ? Object.assign({}, item, {
                        start_time: moment(json.start_date).valueOf(),
                        end_time: moment(json.end_date).valueOf(),
                        group: json.machine
                    })
                    : item)
                  ),
                pendingItemMove: null,
                pendingItemResize: null,
              };
            })
          } else {
            this.setState(prevState => {
                return {
                    ...prevState,
                    items: prevState.items.map(item =>
                        item.id === assignmentID
                            ? Object.assign({}, item, {
                                id: json.pk,
                                start_time: moment(json.start_date).valueOf(),
                                end_time: moment(json.end_date).valueOf(),
                                group: json.machine
                            })
                            : item
                    ),
                    pendingItemMove: null,
                    pendingItemResize: null,
                    selected: prevState.selected.map(item => item == assignmentID ? json.pk : item)
                };
            })
          }
        }).catch(error => {
            console.log("Something bad happened while trying to edit the current machine assignment." + error);
        });
      } else {
        if (old_machine > 0) {
          fetch('rest/assignment_tasks/' + assignmentID + "/", {
              method: 'DELETE',
              headers: {
                  "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
              }
          }).then(response => {
            if (response.status == 204) {
              this.setState(prevState => {
                  return {
                      ...prevState,
                      items: prevState.items.map(item =>
                          item.id === assignmentID
                              ? Object.assign({}, item, {
                                  start_time: start_date,
                                  end_time: end_date,
                                  group: machine
                              })
                              : item
                      ),
                      pendingItemMove: null,
                      pendingItemResize: null,
                  };
              })
            } else {
              console.log("FAILED TO DELETE")
            }
          })
        } else {
          this.setState(prevState => {
              return {
                  ...prevState,
                  items: prevState.items.map(item =>
                      item.id === assignmentID
                          ? Object.assign({}, item, {
                              start_time: start_date,
                              end_time: end_date,
                              group: machine
                          })
                          : item
                  ),
                  pendingItemMove: null,
                  pendingItemResize: null,
              };
          })
        }
      }
    }

    _closeDialog = (isConfirm) => {
        this.setState(prevState => ({ ...prevState, dialogState: { showDialog: false, showCancelButton: false } }), () => {
            if (isConfirm) {
                this._applyPendingChanges();
            }
        });
    }

    _handleItemSelect = (itemId, e, time) => {
      console.log(itemId)
      console.log(e)
      console.log(time)
        const selectedItem = this.state.items.find(item => item.id === itemId);

        var selected = this.state.items.filter(item => item.patient_id === selectedItem.patient_id);
        selected = selected.map(item => item.id);

        // select all items with the same patient, so we highlight the history of the patient
        this.setState(prevState => ({
            ...prevState,
            selected: selected,
            selectedItem: selectedItem,
        }));
    }

    _handleItemDeselect = (e) => {
        this.setState(prevState => ({
            ...prevState,
            selected: [],
            selectedItem: null,
        }));
    }

    _onPatientSelected = (e) => {
        const value = e.target.value;
        this.setState(prevState => ({
            ...prevState, selectedPatient: value
        }));
    }

    _onMachineSelected = (e) => {
        const value = e.target.value;
        this.setState(prevState => ({
            ...prevState, selectedMachine: value
        }));
        console.log("STATE", this.state)
    }

    _bufferNewAssignment = (patient) => {
      const newItem = {
          id: Math.max(...this.state.items.map(item => item.id))+1,
          group: 0,
          title: patient.name,
          start_time: new Date().valueOf(),
          end_time: new Date().valueOf() + 24*60*60*1000,
          canChangeGroup: true,
          patient_id: patient.pk,
          machine_location: null,
          machine_model: null,
          canMove: this.props.me && this.props.me.permission_task_edit,
          canResize: this.props.me && this.props.me.permission_task_edit ? "both" : false,
      };
      this.setState({items: [...this.state.items, newItem], create_isOpen: false});
      //window.scrollTo(0, 0)
    }

    _commitNewAssignment = () => {
        // OK, now let's see if this is actually a valid assignment
        const startDate = moment(this.state.selectedStartDate).valueOf();
        const endDate = moment(this.state.selectedEndDate).valueOf();

        if (startDate > endDate) {
            this.setState(prevState => ({
                ...prevState,
                dialogState: {
                    showDialog: true,
                    dialogTitle: "Error",
                    dialogText: "The start date needs to be before the end date.",
                    showCancelButton: false,
                },
            }));
            return;
        }

        const isValidOperation = this._isValidOperation(null, startDate, endDate, this.state.selectedPatient, this.state.selectedMachine);
        if (!isValidOperation) {
            this._showMachineOrPatientAssignedDialog();
            return;
        }

        const selectedPatient = this.state.allPatients.find(patient => patient.id == this.state.selectedPatient);

        // shift end day with one day, to include the end date too
        var shiftedEndDate = new Date(this.state.selectedEndDate);
        shiftedEndDate = new Date(shiftedEndDate.setDate(shiftedEndDate.getDate() + 1));

        // actually commit
        fetch('rest/assignment_tasks/', {
            method: 'POST',
            body: JSON.stringify({
                patient: this.state.selectedPatient,
                machine: this.state.selectedMachine,
                patient_name: selectedPatient.name,
                start_date: this.state.selectedStartDate.toISOString(),
                end_date: shiftedEndDate.toISOString(),
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
            }
        }).then(response => {
            return response.json();
        }).then(json => {
            // optimistically update the state with the new item
            const newItem = {
                id: json.pk,
                group: json.machine,
                title: json.patient_name,
                start_time: moment(json.start_date).valueOf(),
                end_time: moment(json.end_date).valueOf(),
                canChangeGroup: true,
                patient_id: json.patient,
                machine_location: json.machine_location,
                machine_model: json.machine_model,
                canMove: this.props.me && this.props.me.permission_task_edit,
                canResize: this.props.me && this.props.me.permission_task_edit ? "both" : false,
            };
            this.setState(prevState => ({
                ...prevState,
                selectedStartDate: null,
                selectedEndDate: null,
                selectedPatient: -1,
                selectedMachine: -1,
                items: prevState.items.concat([newItem]),
            }));
        }).catch(error => {
            console.log("Something bad happened while trying to create a new assgiment." + error);
        });
    }

    _showMachineOrPatientAssignedDialog = () => {
        this.setState(prevState => ({
            ...prevState,
            dialogState: {
                showDialog: true,
                dialogTitle: "Error",
                dialogText: "Machine or patient already assigned during this time interval!",
                showCancelButton: false,
            },
        }));
    }

    _isValidOperation = (itemID, tentativeStartDate, tentativeEndDate, tentativePatientID, tentativeMachineID) => {
        for (var i = 0; i < this.state.items.length; i++) {
            // check if the current patient already has an assignment for those days or if the machine is assigned
            const item = this.state.items[i];

            // don't check the current item against itself (for edit operations)
            if (item.id == itemID) {
                continue;
            }

            if (this._datesIntersect(tentativeStartDate, tentativeEndDate, item.start_time, item.end_time)) {
                if (item.patient_id == tentativePatientID) {
                    return false;
                }
                if (item.group == tentativeMachineID) {
                    return false;
                }
            }
        };

        return true;
    }

    _datesIntersect = (startDate1, endDate1, startDate2, endDate2) => {
        return startDate1 < endDate2 && endDate1 > startDate2;
    }

    render() {
        const isLoaded = this.state.allPatients !== null &&
            this.state.allMachines !== null &&
            this.state.items !== null;

        var locations = []
        var machinetypes = []
        var bool_machine_followed_dict = {}
        var models = []
        var locations = []
        var the_filter = (item) => {
          return (
            (this.state.filter_machine == "--(All)--" || this.state.filter_machine == item.machine_model) &&
            (this.state.filter_location == "--(All)--" || this.state.filter_location == item.machine_location)
          );
        }
        if (isLoaded) {
            var patient_list = this.state.allPatients.map(patient => {
                return (
                    <option value={patient.id}>{patient.name}</option>
                );
            });
            var machine_list = this.state.allMachines.map(machine => {
                return (
                    <option value={machine.id}>{machine.machine_model}</option>
                );
            });
            locations = [...new Set(this.state.allMachines.map(machine => machine.machine_location))]
            machinetypes = [...new Set(this.state.allMachines.map(machine => machine.machine_model))]
            this.state.allMachines.forEach((item, i) => { bool_machine_followed_dict[item.id] = this.state.selectedItem == null });
            this.state.items.filter(task => (this.state.selectedItem == null || task.patient_id == this.state.selectedItem.patient_id)).forEach((item, i) => {
              bool_machine_followed_dict[item.group] = true
            });
            this.groups_filtered = [{id: 0, title: "Buffer row"}, ...this.state.groups.filter(the_filter).filter(item => (!this.state.filter_follow || bool_machine_followed_dict[item.id]))]
            models = [...new Set(this.state.data_patients.map(patient => patient.machine_assigned_model))]
            locations = [...new Set(this.state.data_patients.map(patient => patient.location))]
        }
        console.log("Machines", this.state.allMachines);
        console.log("Items", this.state.items);
        return (
            <div className="content">
                <Row>
                    <Dialog
                        open={this.state.dialogState.showDialog}
                        onClose={() => this._closeDialog(false)}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{this.state.dialogState.dialogTitle}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {this.state.dialogState.dialogText}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            {this.state.dialogState.showCancelButton &&
                                <Button onClick={() => this._closeDialog(false)} color="primary">
                                    Cancel
                        </Button>}
                            <Button onClick={() => this._closeDialog(true)} color="primary" autoFocus>
                                Ok
                        </Button>
                        </DialogActions>
                    </Dialog>


                    <div style={{maxHeight: "400px", overflow: "auto"}}>
                    <Card className="card-chart" style={{ zIndex: 1 }}>
                        {!isLoaded ? <div>Loading...</div> :
                            <Timeline
                                groups={this.groups_filtered}
                                items={this.state.items}
                                //traditionalZoom
                                itemTouchSendsClick={true}
                                //canMove={true}
                                //canResize={"both"}
                                defaultTimeStart={moment().add(-12, 'day')}
                                defaultTimeEnd={moment().add(12, 'day')}
                                onItemMove={this._handleItemMove}
                                onItemResize={this._handleItemResize}
                                onItemSelect={this._handleItemSelect}
                                onItemDeselect={this._handleItemDeselect}
                                selected={this.state.selected}
                                minZoom={2 * 60 * 60 * 1000}
                                maxZoom={0.25 * 365.24 * 86400 * 1000}
                            >
                                <TimelineHeaders className="sticky">
                                    <SidebarHeader>
                                        {({ _ }) => {
                                            return <div style={{ alignSelf: "center", color: "white", textAlign: "center", width: "200px" }}>Machine</div>;
                                        }}
                                    </SidebarHeader>
                                    <DateHeader unit="primaryHeader" />
                                    <DateHeader />
                                </TimelineHeaders>
                                <TimelineMarkers>
                                    <TodayMarker interval={FIVE_SECONDS_MS}>
                                        {({ styles, date }) =>
                                            <div style={{ ...styles, backgroundColor: 'red' }} />
                                        }
                                    </TodayMarker>
                                </TimelineMarkers>
                            </Timeline>}
                    </Card>
                    </div>
                </Row>

                <Row>
                    <Card>
                        <CardHeader>
                          <Row>
                            <Col className="px-md-1" md="8">
                              <CardTitle tag="h4">Assignments</CardTitle>
                            </Col>
                            <Col className="px-md-1" md="2">
                              <Button
                                color="secondary"
                                onClick={() => this.setState({
                                  create_isOpen: false,
                                  filter_isOpen: !this.state.filter_isOpen
                                })}
                                >
                                Filter assignments
                              </Button>
                            </Col>
                            {this.props.me && this.props.me.permission_task_edit && (
                              <Col className="px-md-1" md="2">
                                <Button
                                  color="secondary"
                                  onClick={() => this.setState({
                                    create_isOpen: !this.state.create_isOpen,
                                    filter_isOpen: false
                                  })}
                                  >
                                  Create assignemnt
                                </Button>
                              </Col>
                            )}
                          </Row>
                        </CardHeader>
                        <CardBody>
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
                                    {machinetypes.map((val, i) => {return (
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
                              <Col className="px-md-1" md="2">
                                <FormGroup>
                                  <label>
                                    Follow
                                  </label>
                                  <Input
                                    name="name"
                                    type="checkbox"
                                    checked={this.state.filter_follow}
                                    onChange={(event) => {this.setState({filter_follow: !this.state.filter_follow})}}
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                          </Form>
                        </Collapse>
                        <Collapse isOpen={this.state.create_isOpen}>
                          <Form>
                            <Row>
                              <Col className="text-left" md="2">
                                <FormGroup>
                                  <label>
                                    Nickname
                                  </label>
                                  <Input
                                    name="namec"
                                    type="text"
                                    onChange={(event) => {this.setState({filterc_name: event.target.value})}}
                                  />
                                </FormGroup>
                              </Col>
                              <Col className="px-md-1" md="2">
                                <FormGroup>
                                  <label>
                                    Model
                                  </label>
                                  <Input
                                    name="modelc"
                                    type="select"
                                    onChange={(event) => {this.setState({filterc_machine: event.target.value})}}
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
                                    name="locationc"
                                    type="select"
                                    onChange={(event) => {this.setState({filterc_location: event.target.value})}}
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
                                    name="severityc"
                                    type="select"
                                    onChange={(event) => {this.setState({filterc_severity: event.target.value})}}
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
                          <div style={{maxHeight: "400px", overflow: "auto"}}>
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
                                {this.state.data_patients.map(patient => {return(
                                  (this.state.filterc_severity == "--(All)--" || this.state.filterc_severity == patient.severity) &&
                                  (this.state.filterc_machine == "--(All)--" || this.state.filterc_machine == patient.machine_assigned_model || this.state.filterc_machine == "" && patient.machine_assigned_model == null) &&
                                  (this.state.filterc_location == "--(All)--" || this.state.filterc_location == patient.location) &&
                                  (this.state.filterc_name.length > 0 || this.state.filterc_name.length <= patient.name.length && this.state.filterc_name.toLowerCase() == patient.name.substring(0, this.state.filterc_name.length).toLowerCase()) &&
                                  <PatientRow
                                    key={patient.pk}
                                    pk={patient.pk}
                                    name={patient.name}
                                    admission_date={patient.admission_date}
                                    severity={patient.severity}
                                    location={patient.location}
                                    machine_assigned_model={patient.machine_assigned_model}
                                    onClick={this._bufferNewAssignment.bind(this, patient)}
                                  />
                                )})}
                              </tbody>
                            </Table>
                          </div>
                        </Collapse>
                        </CardBody>
                    </Card>
                </Row>
            </div >
        );
    }
}

export default Ventilators;
