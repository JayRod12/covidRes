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
import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line, Bar, Scatter } from "react-chartjs-2";

import csvData from 'assets/files/data.csv';

import moment from 'moment'
import Papa from "papaparse"

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Label,
  FormGroup,
  Input,
  Table,
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";

// core components
import {
  chartExample1,
  chartExample2,
  chartExample3,
  chartExample4
} from "variables/charts.js";

const IS_DEV = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const colors = ["#00d6b4", "#d048b6", "#1f8ef1", "#f1c40f", "#e74c3c", " #d35400", "#2e4053", "#48c9b0"];
function convertHex(hex,opacity){
    hex = hex.replace('#','');
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);

    var result = 'rgba('+r+','+g+','+b+','+opacity+')';
    return result;
}

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      machine_data: [],
      assignement_data: [],
      //nb_of_machines : [],
      loaded: false,
      placeholder: "Loading",
      error_message: "",
      bigChartData: "data1",
      data: { datasets: [], labels: [], total: 0 },
      //      date: '',
      //plotmachine: { datasets: [], labels: [], total: 0 }
      filter_per_location: "--(All)--",
      filter_per_model: "--(All)--"
    }
    this.updateData = this.updateData.bind(this);
  }
  on_location_change = (event) => {
    const value = event.target.value
    this.setState(prevState => ({...prevState, filter_per_location: value}))
  }
  on_model_change = (event) => {
    const value = event.target.value
    this.setState(prevState => ({...prevState, filter_per_model: value}))
  }
  setBgChartData = name => {
    this.setState({
      bigChartData: name
    });
  };

  componentDidMount() {
    Papa.parse(csvData, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: this.updateData
    });
    fetch("rest/machines/")
      .then(response => {
        if (response.status > 400) {
          throw new Error(response.status);
        }
        return response.json();
      })
      .then(machine_data => {
        console.log(machine_data);
        this.setState(() => {
          return {
            machine_data,
            loaded: true
          };
        });
      })
      .catch(error => {
        this.setState(() => {
          return {
            loaded: true,
            placeholder: "Failed to load",
            error_message: "You don't have permission to view these machines.",
          };
        });
      });

    // fetch machine assignements
    fetch("rest/assignment_tasks/")
      .then(response => {
        if (response.status > 400) {
          throw new Error(response.status);
        }
        return response.json();
      })
      .then(assignement_data => {
        console.log(assignement_data);
        this.setState(() => {
          return {
            assignement_data,
            loaded: true
          };
        });
      })
      .catch(error => {
        this.setState(() => {
          return {
            loaded: true,
            placeholder: "Failed to load",
            error_message: "You don't have permission to view these assignements.",
          };
        });
      });

    var tempDate = new Date();
    var date = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate() + ' ' + tempDate.getHours() + ':' + tempDate.getMinutes() + ':' + tempDate.getSeconds();
    console.log(date);

    {/*var that = this;
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds
    that.setState({
      //Setting the value of the date time
      date:
        date + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec,
    });
    console.log(this.state); */}


  }

  updateData(result) {
    const labels = result.data.map(point => point.month);
    const datasets = result.data.map(point => parseInt(point.people));
    var total = 0;
    result.data.forEach(point => {
      total += parseInt(point.people);
    });
    this.setState(prevState => ({ ...prevState, data: { datasets: datasets, labels: labels, total: total } }));
  }


  render() {
    const ourChartData = {
      data: canvas => {
        let ctx = canvas.getContext("2d");

        let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

        gradientStroke.addColorStop(1, "rgba(66,134,121,0.15)");
        gradientStroke.addColorStop(0.4, "rgba(66,134,121,0.0)"); //green colors
        gradientStroke.addColorStop(0, "rgba(66,134,121,0)"); //green colors

        return {
          labels: this.state.data.labels,
          datasets: [
            {
              label: "Number of patients",
              fill: true,
              backgroundColor: gradientStroke,
              borderColor: "#00d6b4",
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: "#00d6b4",
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: "#00d6b4",
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              data: this.state.data.datasets,
            }
          ]
        };
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false
        },

        tooltips: {
          backgroundColor: "#f5f5f5",
          titleFontColor: "#333",
          bodyFontColor: "#666",
          bodySpacing: 4,
          xPadding: 12,
          mode: "nearest",
          intersect: 0,
          position: "nearest"
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(29,140,248,0.0)",
                zeroLineColor: "transparent"
              },
              ticks: {
                suggestedMin: 50,
                suggestedMax: 125,
                padding: 20,
                fontColor: "#9e9e9e"
              }
            }
          ],

          xAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(0,242,195,0.1)",
                zeroLineColor: "transparent"
              },
              ticks: {
                padding: 20,
                fontColor: "#9e9e9e"
              }
            }
          ]
        }
      }
    };

    // GETTING DATA FOR  MACHINES PER TYPE AVAILABLE PLOT
    ///////////////////////////////////////////////////////////////////////////////////////////

    if (this.state.machine_data.length == 0) return (<div>Loading</div>);
    //const hamilton = this.state.machine_data.results.filter(item => item.model_name === 'Hamilton');
    //const hamiltonCount = hamilton.length;

    const results = IS_DEV ? this.state.machine_data.results : this.state.machine_data;
    const assignmentResults = IS_DEV ? this.state.assignement_data.results : this.state.assignement_data;

    const machTypes = results
      .map(dataItem => dataItem.model_name) // get all media types
      .filter((model_name, index, array) => array.indexOf(model_name) === index), // filter out duplicates

      counts = machTypes
        .map(machineType => ({
          type: machineType,
          count: results.filter(item => item.model_name === machineType).length
        }));

    const label_machines = counts.map(item => item.type)

    const data_plot_machines = counts.map(item => item.count)

    const total_machines = data_plot_machines.reduce((result, number) => result + number)


    /////////////////////////////////////////////////////////////////////////////
    // GETTING DATA FOR  MACHINES PER LOCATION AVAILABLE PLOT
    ///////////////////////////////////////////////////////////////////////////////////////////

    if (this.state.machine_data.length == 0) return (<div>Loading</div>);

    console.log(this.state.machine_data);

    const FloorLoc = results.filter(item => item.location === 'First floor');
    const Floorcount = FloorLoc.length;

    console.log(FloorLoc)
    console.log(Floorcount)

    const machLocations = results
      .map(dataItem => dataItem.location) // get all media types
      .filter((location, index, array) => array.indexOf(location) === index), // filter out duplicates

      countsLocation = machLocations
        .map(machineLoc => ({
          type: machineLoc,
          count: results.filter(item => item.location === machineLoc).length
        }));

    const label_machines_location = countsLocation.map(item => item.type)

    const data_plot_machines_location = countsLocation.map(item => item.count)

    /////////////////////////////////////////////////////////////////////////////
    ///////////////////////// ASSIGNEMENTS ON TODAY per location
    if (this.state.assignement_data.length == 0) return (<div>Loading</div>);

    var tempDate = new Date();
    var date_today = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate() + ' ' + tempDate.getHours() + ':' + tempDate.getMinutes() + ':' + tempDate.getSeconds();
    const AD = assignmentResults.filter(item => new Date(item.start_date) - new Date(date_today) < 0);
    const ADn = AD.filter(item => new Date(item.end_date) - new Date(date_today) > 0);
    const Machines_today_pk = ADn.map(item => item.machine)
    const Machines_today = Machines_today_pk.map(item => {
      return results.find(element => element.pk == item)
    })

    console.log(date_today)
    console.log(AD)
    console.log(ADn)
    console.log(Machines_today_pk)

    // const machtodayLocations = Machines_today
    //     .map(dataItem => dataItem.location) // get all media types
    //   .filter((location, index, array) => array.indexOf(location) === index), // filter out duplicates


    const countstodayLocation = machLocations
      .map(machineLoc => ({
        type: machineLoc,
        count: Machines_today.filter(item => item.location === machineLoc).length
      }));


    const countstodayType = machTypes
      .map(machineType => ({
        type: machineType,
        count: Machines_today.filter(item => item.model_name === machineType).length
      }));

    ///////////////////////////////////////////RESULT PER LOCATION:PLOT THIS///////////////////////
    const label_machines_today_location = countstodayLocation.map(item => item.type)

    const data_plot_machines_today_location = countstodayLocation.map(item => item.count)

    console.log(this.state.assignement_data)

    const data_plot_machines_location_sub = data_plot_machines_location
      .map((item, index) => data_plot_machines_location[index] - data_plot_machines_today_location[index])

    const label_machines_today_type = countstodayType.map(item => item.type)

    const data_plot_machines_today_type = countstodayType.map(item => item.count)

    const data_plot_machines_type_sub = data_plot_machines
      .map((item, index) => data_plot_machines[index] - data_plot_machines_today_type[index])


      ///////////////////////////////// TOTAL MACHINES AVAILABLE PER DAY THIS WEEK
      if (this.state.assignement_data.length == 0) return (<div>Loading</div>);
      const D0_count = ADn.length

      const date_today1= new Date(date_today)
        date_today1.setDate(date_today1.getDate() + 1)

      //var date_today1 = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + (tempDate.getDate() + 1) + ' ' + tempDate.getHours() + ':' + tempDate.getMinutes() + ':' + tempDate.getSeconds();
      const AD1 = assignmentResults.filter(item => new Date(item.start_date) - new Date(date_today1) < 0);
      const ADn1 = AD1.filter(item => new Date(item.end_date) - new Date(date_today1) > 0);
      const D1_count = ADn1.length


      const date_today2= new Date(date_today1)
        date_today2.setDate(date_today1.getDate() + 1)
      const AD2 = assignmentResults.filter(item => new Date(item.start_date) - new Date(date_today2) < 0);
      const ADn2 = AD2.filter(item => new Date(item.end_date) - new Date(date_today2) > 0);
      const D2_count = ADn2.length

      const date_today3= new Date(date_today2)
        date_today3.setDate(date_today3.getDate() + 1)
      const AD3 = assignmentResults.filter(item => new Date(item.start_date) - new Date(date_today3) < 0);
      const ADn3 = AD3.filter(item => new Date(item.end_date) - new Date(date_today3) > 0);
      const D3_count = ADn3.length

      const date_today4= new Date(date_today3)
        date_today4.setDate(date_today4.getDate() + 1)
      const AD4 =  assignmentResults.filter(item => new Date(item.start_date) - new Date(date_today4) < 0);
      const ADn4 = AD4.filter(item => new Date(item.end_date) - new Date(date_today4) > 0);
      const D4_count = ADn4.length

      const date_today5= new Date(date_today4)
        date_today5.setDate(date_today5.getDate() + 1)
      const AD5 = assignmentResults.filter(item => new Date(item.start_date) - new Date(date_today5) < 0);
      const ADn5 = AD5.filter(item => new Date(item.end_date) - new Date(date_today5) > 0);
      const D5_count = ADn5.length


      const date_today6= new Date(date_today5)
        date_today6.setDate(date_today6.getDate() + 1)
      const AD6 = assignmentResults.filter(item => new Date(item.start_date) - new Date(date_today6) < 0);
      const ADn6 = AD6.filter(item => new Date(item.end_date) - new Date(date_today6) > 0);
      const D6_count = ADn6.length

      const date_today7= new Date(date_today6)
        date_today7.setDate(date_today7.getDate() + 1)
      const AD7 = assignmentResults.filter(item => new Date(item.start_date) - new Date(date_today7) < 0);
      const ADn7 = AD7.filter(item => new Date(item.end_date) - new Date(date_today7) > 0);
      const D7_count = ADn7.length

      const M_used_week = [D0_count, D1_count, D2_count, D3_count, D4_count, D5_count, D6_count, D7_count]
      console.log(M_used_week)

      console.log(this.state.assigement_data)
      const days_from_today = ["today", "1", "2", "3", "4", "5", "6", "7"]

      /// JOAN TIME
      const install_tasks = assignmentResults.map(item => { return ({
        date: new Date(item.start_date),
        model: item.machine_model,
        value: 1
      })});
      const remove_tasks = assignmentResults.map(item => { return ({
        date: new Date(item.end_date),
        model: item.machine_model,
        value: -1
      })});
      const tasks = install_tasks.concat(remove_tasks).filter(
        item => item.date > new Date(date_today)
      ).filter(
        item => item.date < new Date(date_today7)
      ).sort(function(a, b) {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
      })
      const machinetypes = [...new Set(results.map(item => item.model_name))];/// The Set trick is to get unique values
      const locations = [...new Set(results.map(item => item.location))];
      var time_evolution_per_machine = {}
      machinetypes.forEach((model, i) => {
        const used_now = assignmentResults.filter(
          item => item.machine_model == model
        ).filter(
          item => new Date(item.start_date) < new Date(date_today)
        ).filter(
          item => new Date(item.end_date) > new Date(date_today)
        ).length
        time_evolution_per_machine[model] = [{x: new Date(date_today), y:used_now}];
      });
      tasks.forEach((item, i) => {
        const last_item_y = time_evolution_per_machine[item.model][time_evolution_per_machine[item.model].length-1].y;
        time_evolution_per_machine[item.model] = [...time_evolution_per_machine[item.model], {x: item.date, y: last_item_y+item.value}]
      });
      machinetypes.forEach((item, i) => {
        const last_item_y = time_evolution_per_machine[item][time_evolution_per_machine[item].length-1].y;
        time_evolution_per_machine[item] = [...time_evolution_per_machine[item], {x: new Date(date_today7), y: last_item_y}]
      });
      const data_joan = canvas => {
        let ctx = canvas.getContext("2d");

        return {
          datasets: machinetypes.map((item, ii) => {
            let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

            gradientStroke.addColorStop(1, convertHex(colors[ii%colors.length], 0.15));
            gradientStroke.addColorStop(0, convertHex(colors[ii%colors.length], 0)); //blue colors
            return({
              label: item,
              fill: true,
              showLine: true,
              lineTension: 0,
              backgroundColor: gradientStroke,
              borderColor: colors[ii%colors.length],
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: colors[ii%colors.length],
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: colors[ii%colors.length],
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              data: time_evolution_per_machine[item]
          })})
        };
      }

      const options_joan = {
        maintainAspectRatio: false,
        legend: {
          display: true
        },
        tooltips: {
          backgroundColor: "#f5f5f5",
          titleFontColor: "#333",
          bodyFontColor: "#666",
          bodySpacing: 4,
          xPadding: 12,
          mode: "nearest",
          intersect: 0,
          position: "nearest",
          callbacks: {
              title: function (tooltipItem, data) {
                return "Date: " + moment(tooltipItem[0].xLabel).format("HH:mm (D-MMM-YYYY)");
              },
              label: function(tooltipItems, data) {
                return (
                      "Used: " + tooltipItems.yLabel
                  );
              },
              footer: function (tooltipItem, data) { return "..."; }
          }
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(29,140,248,0.0)",
                zeroLineColor: "transparent"
              },
              ticks: {
                suggestedMin: 0,
                padding: 2,
                fontColor: "#9a9a9a"
              }
            }
          ],
          xAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                display: false,
                drawBorder: false,
                color: "rgba(29,140,248,0.1)",
                zeroLineColor: "transparent"
              },
              ticks: {
                suggestedMin: new Date(date_today),
                suggestedMax: new Date(date_today7),
                display: false,
                padding: 20,
                fontColor: "#9a9a9a"
              }
            }
          ]
        }
      };

      var machines_taken_per_location_total = {}
      var machines_taken_per_model_total = {}
      var machines_available_per_location_total = {}
      var machines_available_per_model_total = {}
      var machines_taken_per_location = {}
      var machines_taken_per_model = {}
      var machines_available_per_location = {}
      var machines_available_per_model = {}
      // Initialize to 0
      locations.forEach((location, ii) => {
        machines_taken_per_location_total[location] = 0;
        machines_available_per_location_total[location] = 0;
      });
      machinetypes.forEach((model, ii) => {
        machines_taken_per_model_total[model] = 0;
        machines_available_per_model_total[model] = 0;
      });
      locations.forEach((location, ii) => {
        machines_taken_per_model[location] = Object.assign({}, machines_taken_per_model_total);
        machines_available_per_model[location] = Object.assign({}, machines_taken_per_model_total);
      });
      machinetypes.forEach((model, ii) => {
        machines_taken_per_location[model] = Object.assign({}, machines_taken_per_location_total);
        machines_available_per_location[model] = Object.assign({}, machines_taken_per_location_total);
      });
      // Fill them
      results.forEach((machine, ii) => {
        if (machine.patient_assigned_name == null) {
          machines_available_per_location_total[machine.location]++
          machines_available_per_model_total[machine.model_name]++
          machines_available_per_location[machine.model_name][machine.location]++
          machines_available_per_model[machine.location][machine.model_name]++
        } else {
          machines_taken_per_location_total[machine.location]++
          machines_taken_per_model_total[machine.model_name]++
          machines_taken_per_location[machine.model_name][machine.location]++
          machines_taken_per_model[machine.location][machine.model_name]++
        }
      });
      console.log(results)
      console.log("mtplt", machines_taken_per_location_total)
      console.log("mtpl", machines_taken_per_location)
      console.log("mtpmt", machines_taken_per_model_total)
      console.log("mtpm", machines_taken_per_model)
      // Turn into arrays
      machines_available_per_location_total = locations.map(location => machines_available_per_location_total[location])
      machines_available_per_model_total = machinetypes.map(model => machines_available_per_model_total[model])
      machines_taken_per_location_total = locations.map(location => machines_taken_per_location_total[location])
      machines_taken_per_model_total = machinetypes.map(model => machines_taken_per_model_total[model])
      locations.forEach((location, ii) => {
        machines_available_per_model[location] = machinetypes.map(model => machines_available_per_model[location][model])
        machines_taken_per_model[location] = machinetypes.map(model => machines_taken_per_model[location][model])
      });
      machinetypes.forEach((model, ii) => {
        machines_available_per_location[model] = locations.map(location => machines_available_per_location[model][location])
        machines_taken_per_location[model] = locations.map(location => machines_taken_per_location[model][location])
      });

      /// JOAN TIME END
    /////////////////////////////////////////////////////////////////////////////////

    const ourChartMachinesTotal = {
      data: canvas => {
        let ctx = canvas.getContext("2d");

        let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

        gradientStroke.addColorStop(1, "rgba(72,72,176,0.1)");
        gradientStroke.addColorStop(0.4, "rgba(72,72,176,0.0)"); //purple colors
        gradientStroke.addColorStop(0, "rgba(119,52,169,0)"); //purple colors

        const arbitraryStackkey2 = "stack1";

        return {
          //labels: label_machines,
          labels: machinetypes,
          datasets: [
            {
              stack: arbitraryStackkey2,
              label: "In use",
              fill: true,
              backgroundColor: "#d048b6",
              borderColor: "#d048b6",
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: "#00d6b4",
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: "#00d6b4",
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              //data: data_plot_machines_today_type,
              data: this.state.filter_per_location == "--(All)--" ? machines_taken_per_model_total : machines_taken_per_model[this.state.filter_per_location],
            },
            {
              stack: arbitraryStackkey2,
              label: "Available",
              fill: true,
              backgroundColor: gradientStroke,
              borderColor: "#d048b6",
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: "#00d6b4",
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: "#00d6b4",
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              //data: data_plot_machines_type_sub,
              data: this.state.filter_per_location == "--(All)--" ? machines_available_per_model_total : machines_available_per_model[this.state.filter_per_location],
            }
          ]
        };
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false
        },

        tooltips: {
          backgroundColor: "#f5f5f5",
          titleFontColor: "#333",
          bodyFontColor: "#666",
          bodySpacing: 4,
          xPadding: 12,
          mode: "nearest",
          intersect: 0,
          position: "nearest"
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              //barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(29,140,248,0.0)",
                zeroLineColor: "transparent"
              },
              ticks: {
                suggestedMin: 0,
                suggestedMax: 1,
                padding: 20,
                fontColor: "#9e9e9e"
              }
            }
          ],

          xAxes: [
            {
              // barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(0,242,195,0.0)",
                zeroLineColor: "transparent"
              },
              ticks: {
                padding: 20,
                fontColor: "#9e9e9e"
              }
            }
          ]
        }
      }
    };

    const ourChartMachinesPerLocation = {
      data: canvas => {
        let ctx = canvas.getContext("2d");

        let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

        gradientStroke.addColorStop(1, "rgba(29,140,248,0.2)");
        gradientStroke.addColorStop(0.4, "rgba(29,140,248,0.0)");
        gradientStroke.addColorStop(0, "rgba(29,140,248,0)"); //blue colors

        const arbitraryStackkey = "stack1";

        return {
          //labels: label_machines_location,
          labels: locations,
          datasets: [
            {
              stack: arbitraryStackkey,
              label: "In use",
              fill: true,
              backgroundColor: "#1f8ef1",
              borderColor: "#1f8ef1",
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: "#1f8ef1",
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: "#00d6b4",
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              //data: data_plot_machines_today_location,
              data: this.state.filter_per_model == "--(All)--" ? machines_taken_per_location_total : machines_taken_per_location[this.state.filter_per_model],
            },
            {
              stack: arbitraryStackkey,
              label: "Available",
              fill: true,
              backgroundColor: gradientStroke,
              borderColor: "#1f8ef1",
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: "#1f8ef1",
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: "#00d6b4",
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              //data: data_plot_machines_location_sub,
              data: this.state.filter_per_model == "--(All)--" ? machines_available_per_location_total : machines_available_per_location[this.state.filter_per_model],
            }
          ]
        };
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false
        },

        tooltips: {
          backgroundColor: "#f5f5f5",
          titleFontColor: "#333",
          bodyFontColor: "#666",
          bodySpacing: 4,
          xPadding: 12,
          mode: "nearest",
          intersect: 0,
          position: "nearest"
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              //barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(29,140,248,0.0)",
                zeroLineColor: "transparent"
              },
              ticks: {
                suggestedMin: 0,
                suggestedMax: 1,
                padding: 20,
                fontColor: "#9e9e9e"
              }
            }
          ],

          xAxes: [
            {
              // barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(0,242,195,0.0)",
                zeroLineColor: "transparent"
              },
              ticks: {
                padding: 20,
                fontColor: "#9e9e9e"
              }
            }
          ]
        }
      }
    };

    const ourChartweek = {
      data: canvas => {
        let ctx = canvas.getContext("2d");

        let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

        gradientStroke.addColorStop(1, "rgba(66,134,121,0.15)");
        gradientStroke.addColorStop(0.4, "rgba(66,134,121,0.0)"); //green colors
        gradientStroke.addColorStop(0, "rgba(66,134,121,0)"); //green colors

        return {
          labels: days_from_today,
          datasets: [
            {
              label: "Number of Ventilators",
              fill: true,
              backgroundColor: gradientStroke,
              borderColor: "#00d6b4",
              borderWidth: 2,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: "#00d6b4",
              pointBorderColor: "rgba(255,255,255,0)",
              pointHoverBackgroundColor: "#00d6b4",
              pointBorderWidth: 20,
              pointHoverRadius: 4,
              pointHoverBorderWidth: 15,
              pointRadius: 4,
              data: M_used_week,
            }
          ]
        };
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false
        },

        tooltips: {
          backgroundColor: "#f5f5f5",
          titleFontColor: "#333",
          bodyFontColor: "#666",
          bodySpacing: 4,
          xPadding: 12,
          mode: "nearest",
          intersect: 0,
          position: "nearest"
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(29,140,248,0.0)",
                zeroLineColor: "transparent"
              },
              ticks: {
                suggestedMin: 0,
                suggestedMax: 3,
                padding: 20,
                fontColor: "#9e9e9e"
              }
            }
          ],

          xAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                drawBorder: false,
                color: "rgba(0,242,195,0.1)",
                zeroLineColor: "transparent"
              },
              ticks: {
                padding: 20,
                fontColor: "#9e9e9e"
              }
            }
          ]
        }
      }
    };

    // return (
    //   <h1> Hello </h1>
    //   );
    return (
      <>
        <div className="content">
          {/*}
          <Row>
            <Col xs="12">
              <Card className="card-chart">
                <CardHeader>
                  <Row>
                    <Col className="text-left" sm="6">
                      <h5 className="card-category">Total Shipments</h5>
                      <CardTitle tag="h2">Performance</CardTitle>
                    </Col>
                    <Col sm="6">
                      <ButtonGroup
                        className="btn-group-toggle float-right"
                        data-toggle="buttons"
                      >
                        <Button
                          tag="label"
                          className={classNames("btn-simple", {
                            active: this.state.bigChartData === "data1"
                          })}
                          color="info"
                          id="0"
                          size="sm"
                          onClick={() => this.setBgChartData("data1")}
                        >
                          <input
                            defaultChecked
                            className="d-none"
                            name="options"
                            type="radio"
                          />
                          <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                            Accounts
                          </span>
                          <span className="d-block d-sm-none">
                            <i className="tim-icons icon-single-02" />
                          </span>
                        </Button>
                        <Button
                          color="info"
                          id="1"
                          size="sm"
                          tag="label"
                          className={classNames("btn-simple", {
                            active: this.state.bigChartData === "data2"
                          })}
                          onClick={() => this.setBgChartData("data2")}
                        >
                          <input
                            className="d-none"
                            name="options"
                            type="radio"
                          />
                          <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                            Purchases
                          </span>
                          <span className="d-block d-sm-none">
                            <i className="tim-icons icon-gift-2" />
                          </span>
                        </Button>
                        <Button
                          color="info"
                          id="2"
                          size="sm"
                          tag="label"
                          className={classNames("btn-simple", {
                            active: this.state.bigChartData === "data3"
                          })}
                          onClick={() => this.setBgChartData("data3")}
                        >
                          <input
                            className="d-none"
                            name="options"
                            type="radio"
                          />
                          <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                            Sessions
                          </span>
                          <span className="d-block d-sm-none">
                            <i className="tim-icons icon-tap-02" />
                          </span>
                        </Button>
                      </ButtonGroup>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Line
                      data={chartExample1[this.state.bigChartData]}
                      options={chartExample1.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        */}

          <Row>
            <Col lg="6">
              <Card className="card-chart">
                <CardHeader>
                  <Row>
                    <Col className="text-left" sm="6">
                      <h5 className="card-category">{"Today " + "(Total: " + total_machines + " Ventilators)"}</h5>
                      <CardTitle tag="h3"><i className="tim-icons icon-square-pin text-primary" />{" Machine per Location"}</CardTitle>
                    </Col>
                    <Col sm="4">
                    <Input
                      defaultValue="--(All)--"
                      name="location"
                      type="select"
                      id="locationSelect"
                      onChange={this.on_model_change}
                    >
                      {[<option key={0} value="--(All)--">--(All)--</option>, ...machinetypes.map((val, i) => {return (
                        <option key={i+1} value={val}>{val}</option>
                      )})]}
                    </Input>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Bar
                      data={ourChartMachinesPerLocation.data}
                      options={ourChartMachinesPerLocation.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="6">
              <Card className="card-chart">
                <CardHeader>
                  <Row>
                    <Col className="text-left" sm="6">
                      <h5 className="card-category">{"Today " + "(Total: " + total_machines + " Ventilators)"}</h5>
                      <CardTitle tag="h3"><i className="tim-icons icon-support-17 text-primary" />{" Machine per Type"}</CardTitle>
                    </Col>
                    <Col sm="4">
                    <Input
                      defaultValue="--(All)--"
                      name="location"
                      type="select"
                      id="locationSelect"
                      onChange={this.on_location_change}
                    >
                      {[<option key={0} value="--(All)--">--(All)--</option>, ...locations.map((val, i) => {return (
                        <option key={i+1} value={val}>{val}</option>
                      )})]}
                    </Input>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Bar
                      data={ourChartMachinesTotal.data}
                      options={ourChartMachinesTotal.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4">

            </Col>
          </Row>


          <Row>
            <Col lg="6">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Evolution</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-single-02 text-success" /> {" Ventilators in use"}
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Line
                      data={ourChartweek.data}
                      options={ourChartweek.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="6">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Future projection for Vaud (VD)</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-single-02 text-success" /> {"Daily Hospitalization"}
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Line
                      data={ourChartData.data}
                      options={ourChartData.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Evolution (NEW)</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-single-02 text-success" /> {" Ventilators in use per model"}
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Scatter
                      data={data_joan}
                      options={options_joan}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {/*
            // <Row>
            //   <Col lg="6" md="12">
            //     <Card className="card-tasks">
            //       <CardHeader>
            //         <h6 className="title d-inline">Tasks(5)</h6>
            //         <p className="card-category d-inline"> today</p>
            //         <UncontrolledDropdown>
            //           <DropdownToggle
            //             caret
            //             className="btn-icon"
            //             color="link"
            //             data-toggle="dropdown"
            //             type="button"
            //           >
            //             <i className="tim-icons icon-settings-gear-63" />
            //           </DropdownToggle>
            //           <DropdownMenu aria-labelledby="dropdownMenuLink" right>
            //             <DropdownItem
            //               href="#pablo"
            //               onClick={e => e.preventDefault()}
            //             >
            //               Action
            //             </DropdownItem>
            //             <DropdownItem
            //               href="#pablo"
            //               onClick={e => e.preventDefault()}
            //             >
            //               Another action
            //             </DropdownItem>
            //             <DropdownItem
            //               href="#pablo"
            //               onClick={e => e.preventDefault()}
            //             >
            //               Something else
            //             </DropdownItem>
            //           </DropdownMenu>
            //         </UncontrolledDropdown>
            //       </CardHeader>
            //       <CardBody>
            //         <div className="table-full-width table-responsive">
            //           <Table>
            //             <tbody>
            //               <tr>
            //                 <td>
            //                   <FormGroup check>
            //                     <Label check>
            //                       <Input defaultValue="" type="checkbox" />
            //                       <span className="form-check-sign">
            //                         <span className="check" />
            //                       </span>
            //                     </Label>
            //                   </FormGroup>
            //                 </td>
            //                 <td>
            //                   <p className="title">Update the Documentation</p>
            //                   <p className="text-muted">
            //                     Dwuamish Head, Seattle, WA 8:47 AM
            //                   </p>
            //                 </td>
            //                 <td className="td-actions text-right">
            //                   <Button
            //                     color="link"
            //                     id="tooltip636901683"
            //                     title=""
            //                     type="button"
            //                   >
            //                     <i className="tim-icons icon-pencil" />
            //                   </Button>
            //                   <UncontrolledTooltip
            //                     delay={0}
            //                     target="tooltip636901683"
            //                     placement="right"
            //                   >
            //                     Edit Task
            //                   </UncontrolledTooltip>
            //                 </td>
            //               </tr>
            //               <tr>
            //                 <td>
            //                   <FormGroup check>
            //                     <Label check>
            //                       <Input
            //                         defaultChecked
            //                         defaultValue=""
            //                         type="checkbox"
            //                       />
            //                       <span className="form-check-sign">
            //                         <span className="check" />
            //                       </span>
            //                     </Label>
            //                   </FormGroup>
            //                 </td>
            //                 <td>
            //                   <p className="title">GDPR Compliance</p>
            //                   <p className="text-muted">
            //                     The GDPR is a regulation that requires businesses
            //                     to protect the personal data and privacy of Europe
            //                     citizens for transactions that occur within EU
            //                     member states.
            //                   </p>
            //                 </td>
            //                 <td className="td-actions text-right">
            //                   <Button
            //                     color="link"
            //                     id="tooltip457194718"
            //                     title=""
            //                     type="button"
            //                   >
            //                     <i className="tim-icons icon-pencil" />
            //                   </Button>
            //                   <UncontrolledTooltip
            //                     delay={0}
            //                     target="tooltip457194718"
            //                     placement="right"
            //                   >
            //                     Edit Task
            //                   </UncontrolledTooltip>
            //                 </td>
            //               </tr>
            //               <tr>
            //                 <td>
            //                   <FormGroup check>
            //                     <Label check>
            //                       <Input defaultValue="" type="checkbox" />
            //                       <span className="form-check-sign">
            //                         <span className="check" />
            //                       </span>
            //                     </Label>
            //                   </FormGroup>
            //                 </td>
            //                 <td>
            //                   <p className="title">Solve the issues</p>
            //                   <p className="text-muted">
            //                     Fifty percent of all respondents said they would
            //                     be more likely to shop at a company
            //                   </p>
            //                 </td>
            //                 <td className="td-actions text-right">
            //                   <Button
            //                     color="link"
            //                     id="tooltip362404923"
            //                     title=""
            //                     type="button"
            //                   >
            //                     <i className="tim-icons icon-pencil" />
            //                   </Button>
            //                   <UncontrolledTooltip
            //                     delay={0}
            //                     target="tooltip362404923"
            //                     placement="right"
            //                   >
            //                     Edit Task
            //                   </UncontrolledTooltip>
            //                 </td>
            //               </tr>
            //               <tr>
            //                 <td>
            //                   <FormGroup check>
            //                     <Label check>
            //                       <Input defaultValue="" type="checkbox" />
            //                       <span className="form-check-sign">
            //                         <span className="check" />
            //                       </span>
            //                     </Label>
            //                   </FormGroup>
            //                 </td>
            //                 <td>
            //                   <p className="title">Release v2.0.0</p>
            //                   <p className="text-muted">
            //                     Ra Ave SW, Seattle, WA 98116, SUA 11:19 AM
            //                   </p>
            //                 </td>
            //                 <td className="td-actions text-right">
            //                   <Button
            //                     color="link"
            //                     id="tooltip818217463"
            //                     title=""
            //                     type="button"
            //                   >
            //                     <i className="tim-icons icon-pencil" />
            //                   </Button>
            //                   <UncontrolledTooltip
            //                     delay={0}
            //                     target="tooltip818217463"
            //                     placement="right"
            //                   >
            //                     Edit Task
            //                   </UncontrolledTooltip>
            //                 </td>
            //               </tr>
            //               <tr>
            //                 <td>
            //                   <FormGroup check>
            //                     <Label check>
            //                       <Input defaultValue="" type="checkbox" />
            //                       <span className="form-check-sign">
            //                         <span className="check" />
            //                       </span>
            //                     </Label>
            //                   </FormGroup>
            //                 </td>
            //                 <td>
            //                   <p className="title">Export the processed files</p>
            //                   <p className="text-muted">
            //                     The report also shows that consumers will not
            //                     easily forgive a company once a breach exposing
            //                     their personal data occurs.
            //                   </p>
            //                 </td>
            //                 <td className="td-actions text-right">
            //                   <Button
            //                     color="link"
            //                     id="tooltip831835125"
            //                     title=""
            //                     type="button"
            //                   >
            //                     <i className="tim-icons icon-pencil" />
            //                   </Button>
            //                   <UncontrolledTooltip
            //                     delay={0}
            //                     target="tooltip831835125"
            //                     placement="right"
            //                   >
            //                     Edit Task
            //                   </UncontrolledTooltip>
            //                 </td>
            //               </tr>
            //               <tr>
            //                 <td>
            //                   <FormGroup check>
            //                     <Label check>
            //                       <Input defaultValue="" type="checkbox" />
            //                       <span className="form-check-sign">
            //                         <span className="check" />
            //                       </span>
            //                     </Label>
            //                   </FormGroup>
            //                 </td>
            //                 <td>
            //                   <p className="title">Arival at export process</p>
            //                   <p className="text-muted">
            //                     Capitol Hill, Seattle, WA 12:34 AM
            //                   </p>
            //                 </td>
            //                 <td className="td-actions text-right">
            //                   <Button
            //                     color="link"
            //                     id="tooltip217595172"
            //                     title=""
            //                     type="button"
            //                   >
            //                     <i className="tim-icons icon-pencil" />
            //                   </Button>
            //                   <UncontrolledTooltip
            //                     delay={0}
            //                     target="tooltip217595172"
            //                     placement="right"
            //                   >
            //                     Edit Task
            //                   </UncontrolledTooltip>
            //                 </td>
            //               </tr>
            //             </tbody>
            //           </Table>
            //         </div>
            //       </CardBody>
            //     </Card>
            //   </Col>
            //   // <Col lg="6" md="12">
            //   //   <Card>
            //   //     <CardHeader>
            //   //       <CardTitle tag="h4">Simple Table</CardTitle>
            //   //     </CardHeader>
            //   //     <CardBody>
            //   //       <Table className="tablesorter" responsive>
            //   //         <thead className="text-primary">
            //   //           <tr>
            //   //             <th>Name</th>
            //   //             <th>Country</th>
            //   //             <th>City</th>
            //   //             <th className="text-center">Salary</th>
            //   //           </tr>
            //   //         </thead>
            //   //         <tbody>
            //   //           <tr>
            //   //             <td>Dakota Rice</td>
            //   //             <td>Niger</td>
            //   //             <td>Oud-Turnhout</td>
            //   //             <td className="text-center">$36,738</td>
            //   //           </tr>
            //   //           <tr>
            //   //             <td>Minerva Hooper</td>
            //   //             <td>Curaçao</td>
            //   //             <td>Sinaai-Waas</td>
            //   //             <td className="text-center">$23,789</td>
            //   //           </tr>
            //   //           <tr>
            //   //             <td>Sage Rodriguez</td>
            //   //             <td>Netherlands</td>
            //   //             <td>Baileux</td>
            //   //             <td className="text-center">$56,142</td>
            //   //           </tr>
            //   //           <tr>
            //   //             <td>Philip Chaney</td>
            //   //             <td>Korea, South</td>
            //   //             <td>Overland Park</td>
            //   //             <td className="text-center">$38,735</td>
            //   //           </tr>
            //   //           <tr>
            //   //             <td>Doris Greene</td>
            //   //             <td>Malawi</td>
            //   //             <td>Feldkirchen in Kärnten</td>
            //   //             <td className="text-center">$63,542</td>
            //   //           </tr>
            //   //           <tr>
            //   //             <td>Mason Porter</td>
            //   //             <td>Chile</td>
            //   //             <td>Gloucester</td>
            //   //             <td className="text-center">$78,615</td>
            //   //           </tr>
            //   //           <tr>
            //   //             <td>Jon Porter</td>
            //   //             <td>Portugal</td>
            //   //             <td>Gloucester</td>
            //   //             <td className="text-center">$98,615</td>
            //   //           </tr>
            //   //         </tbody>
            //   //       </Table>
            //   //     </CardBody>
            //   //   </Card>
            //   // </Col>
            // </Row>
        */}
        </div>
      </>
    );
  }
}

export default Dashboard;
