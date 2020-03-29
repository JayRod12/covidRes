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
import { Line, Bar } from "react-chartjs-2";

import csvData from 'assets/files/data.csv';

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

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      machine_data: [],
      //nb_of_machines : [],
      loaded:false,
      placeholder: "Loading",      
      error_message: "",
      bigChartData: "data1",
      data: { datasets: [], labels: [], total: 0 }
      //plotmachine: { datasets: [], labels: [], total: 0 }
    }
    this.updateData = this.updateData.bind(this);
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

    if(this.state.machine_data.length == 0 ) return (<div>Loading</div>);
    console.log(this.state);
    console.log(this.state.machine_data);
    const hamilton = this.state.machine_data.results.filter(item => item.model_name === 'Hamilton');
    const hamiltonCount = hamilton.length;
    console.log(hamiltonCount);


// GETTING DATA FOR PLOT

    const machTypes = this.state.machine_data.results
          .map(dataItem => dataItem.model_name) // get all media types
          .filter((model_name, index, array) => array.indexOf(model_name) === index), // filter out duplicates

        counts = machTypes
    .     map(machineType => ({
              type: machineType,
              count: this.state.machine_data.results.filter(item => item.model_name === machineType).length
           }));

    const label_machines = counts.map(item => item.type)

    const data_plot_machines = counts.map(item => item.count)

    const total_machines = data_plot_machines.reduce((result,number)=>result+number)

    console.log(total_machines)

    const ourChartMachinesTotal = {
          data: canvas => {
            let ctx = canvas.getContext("2d");

            let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

            gradientStroke.addColorStop(1, "rgba(72,72,176,0.1)");
            gradientStroke.addColorStop(0.4, "rgba(72,72,176,0.0)"); //purple colors
            gradientStroke.addColorStop(0, "rgba(119,52,169,0)"); //purple colors

            return {
              labels: label_machines,
              datasets: [
                {
                  label: "Number of patients",
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
                  data: data_plot_machines,
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
          <Row>
            <Col lg="4">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Total Shipments</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-bell-55 text-info" />{" "}
                    763,215
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Line
                      data={chartExample2.data}
                      options={chartExample2.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Machine Use</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-support-17 text-primary" />{ total_machines + "Total Machines "}
                   
                  </CardTitle>
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
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Patient Numbers</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-single-02 text-success" /> {this.state.data.total + " total patients"}
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
