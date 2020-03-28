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
import FamilyNotifications from "views/FamilyNotifications.js";
import PatientList from "views/PatientList.js";
import MachineList from "views/MachineList.js";


var routes = [
  {
    path: "/ventilators",
    name: "Ventilators",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-chart-pie-36",
    component: Ventilators,
    layout: "/"
  },
  {
    path: "/family-notifications",
    name: "Family notifications",
    icon: "tim-icons icon-single-02",
    component: FamilyNotifications,
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
    path: "/machines",
    name: "Machines",
    icon: "tim-icons icon-single-02",
    component: MachineList,
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
];
export default routes;