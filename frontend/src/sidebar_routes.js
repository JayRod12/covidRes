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
import Ventilators from "views/Ventilators.js";
import Dashboard from "views/Dashboard.js";
import Icons from "views/Icons.js";
import Map from "views/Map.js";
import Notifications from "views/Notifications.js";
import Rtl from "views/Rtl.js";
import TableList from "views/TableList.js";
import Typography from "views/Typography.js";
import UserProfile from "views/UserProfile.js";
import FamilyMessages from "views/FamilyMessages.js";
import PatientList from "views/PatientList.js";
import MachineList from "views/MachineList.js";
import TaskList from "views/TaskList.js";
import AdminView from "views/AdminView.js";


var routes = [
  {
    path: "/ventilators",
    name: "Ventilators",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-chart-pie-36",
    component: Ventilators,
    permission: (me) => {return(me.permission_task_see)},
    layout: "/"
  },
  {
    path: "/family-messages",
    name: "Family Messages",
    icon: "tim-icons icon-chat-33",
    component: FamilyMessages,
    permission: (me) => {return(me.permission_message_see)},
    layout: "/"
  },
  {
    path: "/patients",
    name: "Patient View",
    icon: "tim-icons icon-badge",
    component: PatientList,
    permission: (me) => {return(me.permission_patient_see)},
    layout: "/"
  },
  {
    path: "/machines",
    name: "Resource View",
    icon: "tim-icons icon-app",
    component: MachineList,
    permission: (me) => {return(me.permission_machine_see)},
    layout: "/"
  },
  {
    path: "/tasks",
    name: "Tasks",
    icon: "tim-icons icon-bullet-list-67",
    component: TaskList,
    permission: (me) => {return(me.permission_task_see)},
    layout: "/"
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "tim-icons icon-chart-bar-32",
    component: Dashboard,
    permission: (me) => {return(me.permission_machine_see)},
    layout: "/"
  },
  {
    path: "/adm",
    name: "Admin",
    icon: "tim-icons icon-settings",
    component: AdminView,
    permission: (me) => {return(true)},
    layout: "/"
  }
];
export default routes;
