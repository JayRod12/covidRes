import React from "react";
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
    FormGroup,
    Form,
    Input,
    Row,
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


class Ventilators extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            groups: [],
            items: [],
            dialogState: { showDialog: false, dialogTitle: "", dialogText: "" },
            pendingItemMove: null,
            pendingItemResize: null,
            selected: [],
            allPatients: [],
            allMachines: [],
            selectedPatient: -1,
            selectedMachine: -1,
            selectedStartDate: null,
            selectedEndDate: null,
        };
    }

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
                const allPatients = data.results.map(patient => { return { id: patient.pk, name: patient.name } });
                this.setState(prevState => ({
                    ...prevState, allPatients: allPatients
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
                const groups = []; const allMachines = [];
                data.results.forEach(ventilator => {
                    const ventilatorName = ventilator.model_name + " #" + ventilator.pk;
                    groups.push({ id: ventilator.pk, title: ventilatorName });
                    allMachines.push({ id: ventilator.pk, name: ventilatorName })
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
                    const items = [];
                    data.results.forEach(assignment => {
                        items.push({
                            id: assignment.pk,
                            group: assignment.machine,
                            title: assignment.patient_name,
                            start_time: moment(assignment.start_date).valueOf(),
                            end_time: moment(assignment.end_date).valueOf(),
                            canChangeGroup: true,
                            patient_id: assignment.patient,
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
        this.setState(prevState => ({
            ...prevState,
            dialogState: {
                showDialog: true,
                dialogTitle: "Move ventilator?",
                dialogText: "You are about to change the assignment of this ventilator. Please confirm."
            },
            pendingItemMove: { itemId: itemId, dragTime: dragTime, newGroupOrder: newGroupOrder }
        }));
    }

    _handleItemResize = (itemId, time, edge) => {
        this.setState(prevState => ({
            ...prevState,
            dialogState: {
                showDialog: true,
                dialogTitle: "Edit ventilator assignment?",
                dialogText: "You are about to change the assignment of this ventilator. Please confirm."
            },
            pendingItemResize: { itemId: itemId, time: time, edge: edge }
        }));
    }

    _applyPendingChanges = () => {
        if (this.state.pendingItemMove !== null) {
            const { items, groups } = this.state;
            const { itemId, dragTime, newGroupOrder } = this.state.pendingItemMove;
            const group = groups[newGroupOrder];

            this.setState(prevState => {
                return {
                    ...prevState,
                    items: items.map(item =>
                        item.id === itemId
                            ? Object.assign({}, item, {
                                start_time: dragTime,
                                end_time: dragTime + (item.end_time - item.start_time),
                                group: group.id
                            })
                            : item
                    ),
                    pendingItemMove: null,
                };
            })
        }

        if (this.state.pendingItemResize !== null) {
            const { items } = this.state;
            const { itemId, time, edge } = this.state.pendingItemResize;
            this.setState(prevState => ({
                ...prevState,
                items: items.map(item =>
                    item.id === itemId
                        ? Object.assign({}, item, {
                            start_time: edge === "left" ? time : item.start_time,
                            end_time: edge === "left" ? item.end_time : time
                        })
                        : item
                ),
                pendingItemResize: null
            }));
        }
    }

    _closeDialog = (isConfirm) => {
        this.setState(prevState => ({ ...prevState, dialogState: { showDialog: false } }), () => {
            if (isConfirm) {
                this._applyPendingChanges();
            }
        });
    }

    _handleItemSelect = (itemId, e, time) => {
        const selectedItem = this.state.items.find(item => item.id === itemId);

        var selected = this.state.items.filter(item => item.patient_id === selectedItem.patient_id);
        selected = selected.map(item => item.id);

        // select all items with the same patient, so we highlight the history of the patient
        this.setState(prevState => ({
            ...prevState,
            selected: selected
        }));
    }

    _handleItemDeselect = (e) => {
        this.setState(prevState => ({
            ...prevState,
            selected: []
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
    }

    _commitNewAssignment = () => {
        // OK, now let's see if this is actually a valid assignment
        const startDate = moment(this.state.selectedStartDate).valueOf();
        const endDate = moment(this.state.selectedEndDate).valueOf();

        for (var i = 0; i < this.state.items.length; i++) {
            // check if the current patient already has an assignment for those days or if the machine is assigned
            const item = this.state.items[i];
            if (this._datesIntersect(startDate, endDate, item.start_time, item.end_time)) {
                if (item.patient_id == this.state.selectedPatient) {
                    alert("Patient is alredy assigned a machine during the selected time interval");
                    return;
                }
                if (item.group == this.state.selectedMachine) {
                    alert("The machine you are trying to assign is already assigned during the selected time interval.");
                    return;
                }
            }
        };

        const selectedPatient = this.state.allPatients.find(patient => patient.id == this.state.selectedPatient);

        // actually commit
        fetch('rest/assignment_tasks/', {
            method: 'POST',
            body: JSON.stringify({
                patient: this.state.selectedPatient,
                machine: this.state.selectedMachine,
                patient_name: selectedPatient.name,
                start_date: this.state.selectedStartDate.toISOString(),
                end_date: this.state.selectedEndDate.toISOString(),
                date: new Date().toISOString(),
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
            }
        }).then(response => {
            return response.json();
        }).then(json => {
            this.setState(prevState => ({
                ...prevState, selectedStartDate: null, selectedEndDate: null, selectedPatient: -1, selectedMachine: -1
            }));
        }).catch(error => {
            console.log("Something bad happened while trying to create a new assgiment." + error);
        });
    }

    _datesIntersect = (startDate1, endDate1, startDate2, endDate2) => {
        return startDate1 < endDate2 && endDate1 > startDate2;
    }

    render() {
        var patient_list = this.state.allPatients.map(patient => {
            return (
                <option value={patient.id}>{patient.name}</option>
            );
        });
        var machine_list = this.state.allMachines.map(machine => {
            return (
                <option value={machine.id}>{machine.name}</option>
            );
        });
        const isLoaded = this.state.groups.length > 0 &&
            this.state.items.length > 0 &&
            this.state.allPatients.length > 0;

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
                            <Button onClick={() => this._closeDialog(false)} color="primary">
                                Cancel
                        </Button>
                            <Button onClick={() => this._closeDialog(true)} color="primary" autoFocus>
                                Ok
                        </Button>
                        </DialogActions>
                    </Dialog>


                    <Card className="card-chart" style={{ zIndex: 1 }}>
                        {!isLoaded ? <div>Loading...</div> :
                            <Timeline
                                groups={this.state.groups}
                                items={this.state.items}
                                traditionalZoom
                                itemTouchSendsClick={true}
                                canMove={true}
                                canResize={"both"}
                                defaultTimeStart={moment().add(-12, 'day')}
                                defaultTimeEnd={moment().add(12, 'day')}
                                onItemMove={this._handleItemMove}
                                onItemResize={this._handleItemResize}
                                onItemSelect={this._handleItemSelect}
                                onItemDeselect={this._handleItemDeselect}
                                selected={this.state.selected}
                            >
                                <TimelineHeaders className="sticky">
                                    <SidebarHeader>
                                        {({ _ }) => {
                                            return <div style={{ alignSelf: "center", color: "white", textAlign: "center", width: "150px" }}>Machine</div>;
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
                </Row>

                <Row>
                    <Card>
                        <CardHeader>
                            <h5 className="title">New Machine Assignment</h5>
                        </CardHeader>
                        <CardBody>
                            <Form>
                                <Row>
                                    <Col className="pr-md-1" md="3">
                                        <FormGroup>
                                            <label>Select Patient</label>
                                            <Input type="select" id="patientSelect" onChange={this._onPatientSelected}>
                                                <option disabled selected value> -- Select a patient -- </option>
                                                {patient_list}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col className="pl-md-1" md="3">
                                        <FormGroup>
                                            <label>Machine</label>
                                            <Input type="select" id="machineSelect" onChange={this._onMachineSelected}>
                                                <option disabled selected value> -- Select a machine -- </option>
                                                {machine_list}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col className="pl-md-1" md="2">
                                        <FormGroup>
                                            <label>Start Date</label>
                                            <DatePicker
                                                selected={this.state.selectedStartDate}
                                                showPopperArrow={false}
                                                onChange={date => {
                                                    this.setState(prevState => ({
                                                        ...prevState, selectedStartDate: date
                                                    }));
                                                }}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col className="pl-md-1" md="2">
                                        <FormGroup>
                                            <label>End Date</label>
                                            <DatePicker
                                                selected={this.state.selectedEndDate}
                                                showPopperArrow={false}
                                                onChange={date => {
                                                    this.setState(prevState => ({
                                                        ...prevState, selectedEndDate: date
                                                    }));
                                                }}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Form>
                            <Button
                                variant="outlined"
                                type="submit"
                                disabled={
                                    this.state.selectedPatient === -1
                                    || this.state.selectedMachine === -1
                                    || this.state.selectedStartDate === null
                                    || this.state.selectedEndDate === null}
                                onClick={this._commitNewAssignment}
                            >
                                Save
                            </Button>
                        </CardBody>
                    </Card>
                </Row>
            </div >
        );
    }
}

export default Ventilators;
