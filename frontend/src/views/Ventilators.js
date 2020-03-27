import React from "react";
import classNames from "classnames";

import Timeline from 'src/react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'src/react-calendar-timeline/src/lib/Timeline.scss'
import moment from 'moment'

import { Card } from "reactstrap"

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

        const groups = [];
        ventilators.forEach(ventilator => {
            groups.push({ id: ventilator.id, title: ventilator.name });
        });

        const items = [];
        assignments.forEach(assignment => {
            items.push({
                id: assignment.assignmentId,
                group: assignment.ventilatorID,
                title: "Patient Name: " + assignment.patientName + ", Location: " + assignment.location,
                start_time: moment(assignment.startDate).valueOf(),
                end_time: moment(assignment.endDate).valueOf(),
                canChangeGroup: false,
            });
        });

        this.state = {
            groups: groups,
            items: items,
        };
    }

    handleItemMove = (itemId, dragTime, newGroupOrder) => {
        const { items, groups } = this.state;

        const group = groups[newGroupOrder];

        this.setState((prevState, props) => {
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
                )
            };
        })
    };

    handleItemResize = (itemId, time, edge) => {
        const { items } = this.state;

        this.setState({
            items: items.map(item =>
                item.id === itemId
                    ? Object.assign({}, item, {
                        start_time: edge === "left" ? time : item.start_time,
                        end_time: edge === "left" ? item.end_time : time
                    })
                    : item
            )
        });
    };

    render() {
        return (
            <div className="content">
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
                        onItemMove={this.handleItemMove}
                        onItemResize={this.handleItemResize}
                    />
                </Card>
            </div>
        );
    }
}

export default Ventilators;
