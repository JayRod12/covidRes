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

// reactstrap components
import {
  Button,
  Collapse,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardText,
  CardTitle,
  Col,
  Container,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
  UncontrolledDropdown,
  Input,
  InputGroup,
  Modal,
  NavbarBrand,
  Navbar,
  NavLink,
  Nav,
  Row
} from "reactstrap";

import {
  withLocalize,
  Translate,
  LocalizeContext,
  LocalizeProvider
} from 'react-localize-redux';
import { renderToStaticMarkup } from 'react-dom/server';

import common_en from "src/translations/en/common.json"
import adminnavbar_en from "src/translations/en/adminnavbar.json"
const en = Object.assign({}, common_en, adminnavbar_en)

import $ from 'jquery';
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

class AdminNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseOpen: false,
      modalLogin: false,
      modalPassword: false,
      logged_in: false,
      color: "navbar-transparent",
      data: []
    };

    props.initialize({
      languages: [
        { name: 'English', code: 'en' }
      ],
      options: {
        defaultLanguage: 'en',
        renderToStaticMarkup
      }
    });
    props.addTranslationForLanguage(en, 'en');

    this.submitLogin = this.submitLogin.bind(this);
    this.submitLogout = this.submitLogout.bind(this);
    this.submitPassword = this.submitPassword.bind(this);
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateColor);
    fetch("/myself/")
      .then(response => {
        if (response.status > 400) {
          throw new Error(response.status);
        }
        return response.json();
      })
      .then(data => {
        if (data != "Not logged in") {
          this.props.set_me(data)
          this.setState(() => {
            return {
              data,
              modalLogin: false,
              logged_in: true
            };
          });
        }
      })
      .catch(error => {
        console.log(error)
      });
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateColor);
  }
  // function that adds color white/transparent to the navbar on resize (this is for the collapse)
  updateColor = () => {
    if (window.innerWidth < 993 && this.state.collapseOpen) {
      this.setState({
        color: "bg-white"
      });
    } else {
      this.setState({
        color: "navbar-transparent"
      });
    }
  };
  // this function opens and closes the collapse on small devices
  toggleCollapse = () => {
    if (this.state.collapseOpen) {
      this.setState({
        color: "navbar-transparent"
      });
    } else {
      this.setState({
        color: "bg-white"
      });
    }
    this.setState({
      collapseOpen: !this.state.collapseOpen
    });
  };
  // this function is to open the Search modal
  openModalLogin = () => {
    this.setState({
      modalLogin: true,
      modalPassword: false
    });
  };
  openModalPassword = () => {
    this.setState({
      modalLogin: false,
      modalPassword: true
    });
  };
  submitLogin = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    fetch('/login/', {
      method: 'POST',
      body: JSON.stringify({
          username: data.get('username'),
          password: data.get('password'),
      }),
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {
      if (response.status > 400) {
        throw new Error(response.status);
      }
      return response.text();
    }).then(data => {
      if (data == "Success") {
        window.location.reload()
      }else {
        console.log("Unsucces POST", data);
      }
    })
    .catch(error => {
      console.log("Error POST", error)
    })
  };
  submitLogout = (event) => {
    fetch('/logout/', {
      method: 'POST',
      body: "",
      headers: {
          "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
      }
    }).then(response => {
      if (response.status > 400) {
        throw new Error(response.status);
      }
      return response.text();
    }).then(data => {
      if (data == "Success") {
        this.props.set_me(null)
        window.location.reload()
      }else {
        console.log("Unsucces POST", data);
      }
    })
    .catch(error => {
      console.log("Error POST", error)
    })
  };
  submitPassword = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    if (data.get('password') == data.get('password')) {
      fetch('password/', {
        method: 'POST',
        body: JSON.stringify({
            password_old: data.get('old_password'),
            password: data.get('password'),
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8", 'X-CSRFToken': getCookie('csrftoken'),
        }
      }).then(response => {
        if (response.status > 400) {
          throw new Error(response.status);
        }
        return response.text();
      }).then(data => {
        if (data == "Success") {
          window.location.reload()
        }else {
          console.log("Unsucces POST", data);
        }
      })
      .catch(error => {
        console.log("Error POST", error)
      })
    };
  };
  render() {
    const t = this.props.translate
    return (
      <>
        <Navbar
          className={classNames("navbar-absolute", this.state.color)}
          expand="lg"
        >
          <Container fluid>
            <div className="navbar-wrapper">
              <div
                className={classNames("navbar-toggle d-inline", {
                  toggled: this.props.sidebarOpened
                })}
              >
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={this.props.toggleSidebar}
                >
                  <span className="navbar-toggler-bar bar1" />
                  <span className="navbar-toggler-bar bar2" />
                  <span className="navbar-toggler-bar bar3" />
                </button>
              </div>
            </div>
            <button
              aria-expanded={false}
              aria-label="Toggle navigation"
              className="navbar-toggler"
              data-target="#navigation"
              data-toggle="collapse"
              id="navigation"
              type="button"
              onClick={this.toggleCollapse}
            >
              <span className="navbar-toggler-bar navbar-kebab" />
              <span className="navbar-toggler-bar navbar-kebab" />
              <span className="navbar-toggler-bar navbar-kebab" />
            </button>
            <Collapse navbar isOpen={this.state.collapseOpen}>
              <Nav className="ml-auto" navbar>
                 {!this.state.logged_in && (<NavLink tag="li">
                  <h4>Not logged in</h4></NavLink>)}

                {this.state.logged_in && (<NavLink tag="li">
                  <li class="nav-item">
                  <a class="nav-link" href="#"> {this.state.data.username}</a>
                  </li>
                  </NavLink>)}
                <UncontrolledDropdown nav>
                  <DropdownToggle
                    caret
                    color="default"
                    data-toggle="dropdown"
                    nav
                  >
                    <div className="notification d-none d-lg-block d-xl-block" />
                    <i className="tim-icons icon-sound-wave" />
                    <p className="d-lg-none">Notifications</p>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-navbar" right tag="ul">
                    <NavLink tag="li">
                      <DropdownItem className="nav-item">
                        Mike John responded to your email
                      </DropdownItem>
                    </NavLink>
                    <NavLink tag="li">
                      <DropdownItem className="nav-item">
                        You have 5 more tasks
                      </DropdownItem>
                    </NavLink>
                    <NavLink tag="li">
                      <DropdownItem className="nav-item">
                        Your friend Michael is in town
                      </DropdownItem>
                    </NavLink>
                    <NavLink tag="li">
                      <DropdownItem className="nav-item">
                        Another notification
                      </DropdownItem>
                    </NavLink>
                    <NavLink tag="li">
                      <DropdownItem className="nav-item">
                        Another one
                      </DropdownItem>
                    </NavLink>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <UncontrolledDropdown nav>
                  <DropdownToggle
                    caret
                    color="default"
                    data-toggle="dropdown"
                    nav
                    onClick={e => e.preventDefault()}
                  >
                    <div>
                      <i className="tim-icons icon-single-02" />...
                    </div>
                    <p className="d-lg-none">{t("Log out")}</p>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-navbar" right tag="ul">
                    {!this.state.logged_in && (<NavLink tag="li">
                      <DropdownItem className="nav-item" onClick={this.openModalLogin}>Login</DropdownItem>
                    </NavLink>)}
                    {this.state.logged_in && (<><NavLink tag="li">
                      <DropdownItem className="nav-item" onClick={this.openModalPassword}>Reset password</DropdownItem>
                    </NavLink>
                    <DropdownItem divider tag="li" />
                    <NavLink tag="li">
                      <DropdownItem className="nav-item" onClick={this.submitLogout}>Log out</DropdownItem>
                    </NavLink></>)}
                  </DropdownMenu>
                </UncontrolledDropdown>
                <li className="separator d-lg-none" />
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
        <Modal
          style={{width:'240px', height: '400px'}}
          isOpen={this.state.modalLogin}
          toggle={() => {this.setState({modalLogin: false})}}
        >
          <div className="modal-header">
            <Container>
              <Form onSubmit={this.submitLogin}>
                <Row>
                  <FormGroup>
                    <label>
                      {t("Username")}
                    </label>
                    <Input
                      name="username"
                      type="text"
                    />
                  </FormGroup>
                </Row>
                <Row>
                  <FormGroup>
                    <label>
                      {t("Password")}
                    </label>
                    <Input
                      name="password"
                      type="password"
                    />
                  </FormGroup>
                </Row>
                <Row>
                  <Button>
                    {t("Login")}
                  </Button>
                </Row>
              </Form>
            </Container>
          </div>
        </Modal>
        <Modal
          style={{width:'240px', height: '600px'}}
          isOpen={this.state.modalPassword}
          toggle={() => {this.setState({modalPassword: false})}}
        >
          <div className="modal-header">
            <Container>
              <Form onSubmit={this.submitPassword}>
                <Row className="justify-content-md-center">
                  <FormGroup>
                    <label>
                      {t("Old password")}
                    </label>
                    <Input
                      name="old_password"
                      type="password"
                    />
                  </FormGroup>
                </Row>
                <Row className="justify-content-md-center">
                  <FormGroup>
                    <label>
                      {t("Password")}
                    </label>
                    <Input
                      name="password"
                      type="password"
                    />
                  </FormGroup>
                </Row>
                <Row className="justify-content-md-center">
                  <FormGroup>
                    <label>
                      {t("Password (repeat)")}
                    </label>
                    <Input
                      name="password2"
                      type="password"
                    />
                  </FormGroup>
                </Row>
                <Row className="justify-content-md-center">
                  <Button>
                    {t("Change password")}
                  </Button>
                </Row>
              </Form>
            </Container>
          </div>
        </Modal>
      </>
    );
  }
}

export default withLocalize(AdminNavbar);
