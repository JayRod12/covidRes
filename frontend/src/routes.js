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
import FamilyMessages from "views/FamilyMessages.js";
import PatientList from "views/PatientList.js";
import MachineList from "views/MachineList.js";
import PatientProfile from "views/PatientProfile.js";
import MachineProfile from "views/MachineProfile.js";
import TaskList from "views/TaskList.js";
import AdminView from "views/AdminView.js";
import UserProfile from "views/UserProfile.js";
import RoleProfile from "views/RoleProfile.js";
import ModelProfile from "views/ModelProfile.js";


var routes = [
  {
    path: "/ventilators",
    name: "Synopsis",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-chart-pie-36",
    component: Ventilators,
    layout: "/"
  },
  {
    path: "/family-messages",
    name: "Family messages",
    icon: "tim-icons icon-single-02",
    component: FamilyMessages,
    layout: "/"
  },
  {
    path: "/patients",
    name: "Patients",
    icon: "tim-icons icon-single-02",
    component: PatientList,
    layout: "/"
  },
  {
    path: "/patient/:pk",
    name: "Patient-details",
    component: PatientProfile,
    layout: "/"
  },
  {
    path: "/machines",
    name: "Machines",
    icon: "tim-icons icon-single-02",
    component: MachineList,
    layout: "/"
  },
  {
    path: "/machine/:pk",
    name: "Machine-details",
    component: MachineProfile,
    layout: "/"
  },
  {
    path: "/tasks",
    name: "Tasks",
    icon: "icon-bell-55",
    component: TaskList,
    layout: "/"
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-chart-pie-36",
    component: Dashboard,
    layout: "/"
  },
  {
    path: "/icons",
    name: "Icons",
    rtlName: "الرموز",
    icon: "tim-icons icon-atom",
    component: Icons,
    layout: "/"
  },
  {
    path: "/notifications",
    name: "Notifications",
    rtlName: "إخطارات",
    icon: "tim-icons icon-bell-55",
    component: Notifications,
    layout: "/"
  },
  {
    path: "/adm",
    name: "Admin",
    icon: "tim-icons icon-chart-bar-32",
    component: AdminView,
    layout: "/"
  },
  {
    path: "/user/:pk",
    name: "User-details",
    component: UserProfile,
    layout: "/"
  },
  {
    path: "/role/:pk",
    name: "Role-details",
    component: RoleProfile,
    layout: "/"
  },
  {
    path: "/model/:pk",
    name: "Model-details",
    component: ModelProfile,
    layout: "/"
  },
];
export default routes;
