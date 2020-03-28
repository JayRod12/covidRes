import React from "react";
import classNames from "classnames";

import Timeline, {
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
    TimelineMarkers,
    TodayMarker,
} from 'src/react-calendar-timeline'

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

const FIVE_SECONDS_MS = 5 * 1000;

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
                            title: assignment.patient_name,
                            start_time: moment(assignment.start_date).valueOf(),
                            end_time: moment(assignment.end_date).valueOf(),
                            canChangeGroup: true,
                            patient_name: assignment.patient_name,
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

    _handleItemSelect = (itemId, e, time) => {
        const selectedItem = this.state.items.find(item => item.id === itemId);

        // TODO IMPORTANT!! DO THIS BY PATIENT ID, NAME IS PRONE TO ALL SORTS OF BUGS
        var selected = this.state.items.filter(item => item.patient_name === selectedItem.patient_name);
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
                        </Timeline>
                    </Card>}
            </div>
        );
    }
}

export default Ventilators;
