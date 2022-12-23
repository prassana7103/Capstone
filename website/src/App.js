import axios from "axios";
import React from "react";

import './App.css';
import logo from './logo.png';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';



class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            uuid: '',
            phone: '',
            otp: '',
            login_state: '',
            data: {}
        };

        this.handle_uuid_change = this.handle_uuid_change.bind(this);
        this.handle_phone_change = this.handle_phone_change.bind(this);
        this.handle_otp_change = this.handle_otp_change.bind(this);
        this.login_attempt = this.login_attempt.bind(this);
        this.verify_attempt = this.verify_attempt.bind(this);
    }

    componentDidMount() {
        document.title = "Toll System";
    }

    async login_attempt() {
        const { credentials } = this.state;
        const { uuid } = this.state;
        const { phone } = this.state;

        var response = await axios({
            method: 'post',
            url: "http://65.2.185.251:3000/login",
            headers: {},
            data: {
                uuid: uuid,
                phone: phone
            }
        });

        if (response.data == "Success") {
            this.setState({ login_state: "verify" });
        }
    }

    async verify_attempt() {
        const { uuid } = this.state;
        const { phone } = this.state;
        const { otp } = this.state;

        var response = await axios({
            method: 'post',
            url: "http://65.2.185.251:3000/verify",
            headers: {},
            data: {
                uuid: uuid,
                phone: phone,
                otp: otp
            }
        });

        this.setState({ data: response.data });
        this.setState({ login_state: "verified" });

    }

    handle_uuid_change(event) {
        this.setState({ uuid: event.target.value });
    }

    handle_phone_change(event) {
        this.setState({ phone: event.target.value });
    }

    handle_otp_change(event) {
        this.setState({ otp: event.target.value });
    }

    render() {
        const { records } = this.state;
        const { login_state } = this.state;
        const { ngo_name } = this.state;
        return (
            <div className="some">
                <title>Toll System - Login</title>
                {(login_state === "verify") ? (
                    <div className="outer">
                        <div className="inner">
                            <img src={logo} alt="Logo" />
                            <h3>Log in</h3>

                            <div className="form-group">
                                <label>UUID</label>
                                <input type="uuid" className="form-control" value={this.state.uuid} placeholder="Enter UUID" onChange={this.handle_uuid_change} disabled />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input type="phone" className="form-control" value={this.state.phone} placeholder="Enter Phone" onChange={this.handle_phone_change} disabled />
                            </div>

                            <div className="form-group">
                                <label>OTP</label>
                                <input type="otp" className="form-control" placeholder="Enter OTP" onChange={this.handle_otp_change} />
                            </div>

                            <button onClick={this.verify_attempt} className="btn btn-dark btn-lg btn-block">Verify and Login</button>
                        </div>
                    </div>
                ) : ((login_state === "") ? (
                    <div className="outer">
                        <div className="inner">
                            <img src={logo} alt="Logo" />
                            <h3>Log in</h3>

                            <div className="form-group">
                                <label>UUID</label>
                                <input type="uuid" className="form-control" placeholder="Enter UUID" onChange={this.handle_uuid_change} />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input type="phone" className="form-control" placeholder="Enter Phone" onChange={this.handle_phone_change} />
                            </div>

                            <button onClick={this.login_attempt} className="btn btn-dark btn-lg btn-block">Get OTP</button>
                        </div>
                    </div>
                ) : (
                    <div className="outer">
                        <Row className="justify-content-md-center">
                            <Col xs lg="2">
                            </Col>
                            <Col md="auto">
                                <h1>Travel History</h1>
                                <button onClick={this.verify_attempt} className="btn btn-success">Refresh</button>
                                <br />
                                <h4>{this.state.uuid}</h4>
                                <br/>
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>Start Coordinates</th>
                                            <th>End Coordinates</th>
                                            <th>Distance(in Meters)</th>
                                            <th>Toll</th>
                                            <th>Payment</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {this.state.data["trips"].map((record) => (
                                            <tr>
                                                <td>{record.start.timestamp}</td>
                                                <td>{record.start.latitude}, {record.start.longitude}</td>
                                                <td>{record.end.latitude}, {record.end.longitude}</td>
                                                <td>{record.distance}</td>
                                                <td>{record.distance * 0.002}</td>
                                                <td>
                                <Button variant="success" href="http://65.2.185.251:8000" target="_blank">Pay Now</Button>{' '}
                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                
                                <h4>Total Distance Travelled: {this.state.data["distanceTravelled"]}</h4>
                                <h4>Total Toll: {this.state.data["distanceTravelled"]*0.002}</h4>

                            </Col>
                            <Col xs lg="2">
                            </Col>
                        </Row>
                    </div>
                ))}

            </div>
        );
    }
}

export default App;
