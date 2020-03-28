import React from "react";
import classNames from "classnames";

import Timeline from 'src/react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'src/react-calendar-timeline/src/lib/Timeline.scss'
import moment from 'moment'

import { Card } from "reactstrap"

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const groups = [{ id: 1, title: 'group 1' }, { id: 2, title: 'group 2' }]

const ventilators = [
    { id: 1, name: "Ventilator1" },
    { id: 2, name: "Ventilator2" },
    { id: 3, name: "Ventilator3" },
    { id: 4, name: "Ventilator4" },
    { id: 5, name: "Ventilator5" },
    { id: 6, name: "Ventilator6" },
    { id: 7, name: "Ventilator7" },
    { id: 8, name: "Ventilator8" },
    { id: 9, name: "Ventilator9" },
    { id: 10, name: "Ventilator10" },
];

const assignments = [
    { assignmentId: 1, ventilatorID: 1, patientName: "Dolores", location: "Room1", startDate: "2020-03-10", endDate: "2020-03-30" },
    { assignmentId: 2, ventilatorID: 1, patientName: "Raph", location: "Room2", startDate: "2020-04-01", endDate: "2020-04-04" },
    { assignmentId: 3, ventilatorID: 1, patientName: "Jaime", location: "Room2", startDate: "2020-04-10", endDate: "2020-04-22" },
    { assignmentId: 4, ventilatorID: 2, patientName: "Ionut", location: "Room1", startDate: "2020-03-20", endDate: "2020-03-23" },
    { assignmentId: 5, ventilatorID: 2, patientName: "Maria", location: "Room1", startDate: "2020-03-29", endDate: "2020-03-31" },
    { assignmentId: 6, ventilatorID: 2, patientName: "Anca", location: "Room1", startDate: "2020-04-01", endDate: "2020-04-30" },
    { assignmentId: 7, ventilatorID: 3, patientName: "Mircea", location: "Room3", startDate: "2020-03-01", endDate: "2020-03-20" },
    { assignmentId: 8, ventilatorID: 4, patientName: "Joan", location: "Room3", startDate: "2020-03-14", endDate: "2020-03-27" },
    { assignmentId: 9, ventilatorID: 4, patientName: "Patiente", location: "Room3", startDate: "2020-03-29", endDate: "2020-04-05" },
    { assignmentId: 10, ventilatorID: 7, patientName: "Johnny", location: "Room1", startDate: "2020-03-01", endDate: "2020-03-30" },
    { assignmentId: 11, ventilatorID: 8, patientName: "Ben", location: "Room5", startDate: "2020-03-20", endDate: "2020-03-22" },
    { assignmentId: 12, ventilatorID: 8, patientName: "Josh", location: "Room5", startDate: "2020-03-24", endDate: "2020-03-29" },
    { assignmentId: 13, ventilatorID: 10, patientName: "Chris", location: "Room5", startDate: "2020-03-01", endDate: "2020-04-01" },
];

class Ventilators extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            groups: [],
            items: [],
            dialogState: { showDialog: false, dialogTitle: "", dialogText: "" },
            pendingItemMove: null,
            pendingItemResize: null,
        };
    }

    componentDidMount() {
        var ventilatorPromise = fetch("rest/machines/")
            .then(response => {
                if (response.status > 400) {
                    throw new Error(response.status);
                }
                return response.json();
            })
            .then(data => {
                const groups = [];
                data.results.forEach(ventilator => {
                    groups.push({ id: ventilator.pk, title: ventilator.model_name });
                });
                this.setState(prevState => ({
                    ...prevState, groups: groups
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
                            title: "Patient Name: " + assignment.patient_name,
                            start_time: moment(assignment.start_date).valueOf(),
                            end_time: moment(assignment.end_date).valueOf(),
                            canChangeGroup: true,
                        });
                    });
                    this.setState(prevState => ({
                        ...prevState, items: items
                    }));
                })
                .catch(error => {
                    console.log("Something bad happened while trying to fetch ventilator data :( " + error);
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

    render() {
        const isLoaded = this.state.groups.length > 0 && this.state.items.length > 0;

        return (
            <div className="content">
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

                {!isLoaded ? <div>Loading...</div> :
                    <Card className="card-chart">
                        <Timeline
                            groups={this.state.groups}
                            items={this.state.items}
                            showCursorLine
                            itemTouchSendsClick={true}
                            canMove={true}
                            canResize={"both"}
                            defaultTimeStart={moment().add(-12, 'day')}
                            defaultTimeEnd={moment().add(12, 'day')}
                            onItemMove={this._handleItemMove}
                            onItemResize={this._handleItemResize}
                        />
                    </Card>}
            </div>
        );
    }
}

export default Ventilators;
