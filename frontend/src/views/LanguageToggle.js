// @flow
import React from 'react';
// nodejs library that concatenates classes
import classNames from "classnames";

// Cookies
import Cookies from 'universal-cookie';
const cookies = new Cookies();

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

import { withLocalize } from 'react-localize-redux';

const LanguageToggle = ({languages, activeLanguage, setActiveLanguage}) => {
  if (cookies.get("Language") && activeLanguage && cookies.get("Language") != activeLanguage.code){
    setActiveLanguage(cookies.get("Language"))
  }

  const getClass = (languageCode) => {
    return languageCode === activeLanguage.code ? 'active' : ''
  };

  return (
    <UncontrolledDropdown nav>
      <DropdownToggle
        caret
        color="default"
        data-toggle="dropdown"
        nav
      >
        <div className="notification d-none d-lg-block d-xl-block" />
        <i className="tim-icons icon-world" />
        <p className="d-lg-none">Language</p>
      </DropdownToggle>
      <DropdownMenu className="dropdown-navbar" right tag="ul">
        {languages.map((language, ii) => {return(
          <NavLink tag="li">
            <DropdownItem className="nav-item" onClick={() => {
              cookies.set("Language", language.code)
              setActiveLanguage(language.code)
              }}>
              {language.name}
            </DropdownItem>
          </NavLink>
        )})}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default withLocalize(LanguageToggle);
