import React from "react";
import { Navbar, Nav, NavItem } from "react-bootstrap";

import { dgraphAddress } from "../containers/Helpers.js";

import logo from "../assets/images/logo.svg";
import "../assets/css/Navbar.css";

function NavBar(props) {
    let { getShareId, shareId } = props,
        url = "localhost:3000" + "/" + shareId,
        urlClass = shareId === "" ? "Nav-url-hide" : "";
    return (
        <Navbar style={{ borderBottom: "0.5px solid gray" }} fluid={true}>
            <Navbar.Header>
                <Navbar.Brand>
                    <a
                        href="https://dgraph.io"
                        target="blank"
                        style={{ paddingTop: "10px" }}
                    >
                        <img src={logo} width="100" height="30" alt="" />
                    </a>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Nav>
                    <NavItem target="_blank" href="https://docs.dgraph.io">
                        Documentation
                    </NavItem>
                    <NavItem
                        target="_blank"
                        href="https://github.com/dgraph-io/dgraph"
                    >
                        Github
                    </NavItem>
                    <NavItem target="_blank" href="https://open.dgraph.io">
                        Blog
                    </NavItem>
                    <NavItem target="_blank" href="https://dgraph.slack.com">
                        Community
                    </NavItem>
                    <NavItem className="hidden-xs">
                        <form className="form-inline">
                            <button
                                className="btn btn-default"
                                onClick={e => {
                                    e.preventDefault();
                                    getShareId();
                                }}
                            >
                                Share
                            </button>
                            <input
                                style={{
                                    marginLeft: "10px",
                                    width: "350px"
                                }}
                                className={`form-control ${urlClass}`}
                                type="text"
                                value={url}
                                placeholder="Share"
                            />
                        </form>
                    </NavItem>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default NavBar;
