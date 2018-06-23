import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './style.scss';

const root = document.querySelector('.root');
const API_KEY = 'c3187777c811407741591a38da270057';

function getCoordinates() {
  const p = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (e) => {
        resolve(e);
      },
      (e) => {
        reject(e);
      },
    );
  });

  return p;
}

class WeatherContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statusMessage: 'Please Wait.',
      weatherData: null,
      zip: '',
      country: '',
    };
    this.getWeather = this.getWeather.bind(this);
    this.setWeather = this.setWeather.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.permissionDenied = this.permissionDenied.bind(this);
  }

  componentWillMount() {
    const p = getCoordinates();
    p.then((e) => {
      const { longitude, latitude } = e.coords;
      this.getWeather(longitude, latitude);
    }).catch((e) => {
      if (e.code === e.PERMISSION_DENIED) {
        this.permissionDenied();
      }
    });
  }

  onChange(e) {
    const z = e.target.id === 'zipCode';
    const c = e.target.id === 'countryCode';
    if (z) {
      this.setState({
        zip: e.target.value,
      });
    }
    if (c) {
      this.setState({
        country: e.target.value,
      });
    }
  }

  onClick() {
    console.log('inonclick', this.state);
    this.getWeather(null, null);
  }

  setWeather(w) {
    console.log(w);
    let { cod } = w;
    cod = Number(cod);
    if (cod === 200) {
      this.setState({ weatherData: w, statusMessage: 'Weather:' });
    } else if (w.message) {
      this.setState({ statusMessage: w.message });
    }
  }

  getWeather(longitude, latitude) {
    let API_CALL;
    console.log('ingetw', this.state);
    const { zip, country } = this.state;
    if (longitude && latitude) {
      API_CALL = `http://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&lat=${longitude}&lon=${latitude}`;
    } else {
      API_CALL = `http://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&zip=${zip},${country}`;
    }
    fetch(API_CALL, { method: 'get', mode: 'cors' })
      .then(w => w.json())
      .then(this.setWeather)
      .catch(e => console.log(e));
  }

  permissionDenied() {
    this.setState({ statusMessage: 'Please enter you zip and countrycode' });
  }

  render() {
    const { weatherData, statusMessage } = this.state;
    return (
      <Weather
        weatherData={JSON.stringify(weatherData)}
        statusMessage={statusMessage}
        onChange={this.onChange}
        onClick={this.onClick}
      />
    );
  }
}

function Weather(props) {
  const {
    weatherData, statusMessage, onChange, onClick,
  } = props;
  const data = JSON.parse(weatherData);
  function renderData() {
    if (data !== null) {
      const {
        weather, main, name: area, sys,
      } = data;
      const { temp, pressure, humidity } = main;
      const { main: wMain, description } = weather[0];
      const { sunrise, sunset, country } = sys;
      const location = area === '' ? '' : `${area}, ${country}`;
      return (
        <ShowData
          location={location}
          temp={temp}
          pressure={pressure}
          humidity={humidity}
          wMain={wMain}
          description={description}
          sunrise={sunrise}
          sunset={sunset}
        />
      );
    }
    return '';
  }
  return (
    <div className="outerDiv">
      <div className="statusDiv">
        <p>
          <br />
          {statusMessage}
        </p>
      </div>
      {renderData()}
      <div className="inputDiv">
        <input type="number" id="zipCode" onChange={onChange} />
        <input type="text" id="countryCode" onChange={onChange} />
        <button onClick={onClick} type="button">
          OK
        </button>
      </div>
    </div>
  );
}
function ShowData(props) {
  const {
    location, temp, pressure, humidity, wMain, description, sunrise, sunset,
  } = props;
  return (
    <div className="showDivOuter">
      <div className="showDivLess">
        <p>
          {location}
        </p>
        <p>
          {temp}
        </p>
        <p>
          {wMain}
        </p>
      </div>
      <div className="showDivMore">
        <p>
          {description}
        </p>
        <p>
          {pressure}
        </p>
        <p>
          {humidity}
        </p>
        <p>
          {sunrise}
        </p>
        <p>
          {sunset}
        </p>
      </div>
    </div>
  );
}
Weather.propTypes = {
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  weatherData: PropTypes.string.isRequired,
  statusMessage: PropTypes.string.isRequired,
};
ShowData.propTypes = {
  location: PropTypes.string.isRequired,
  temp: PropTypes.number.isRequired,
  pressure: PropTypes.number.isRequired,
  humidity: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  wMain: PropTypes.string.isRequired,
  sunset: PropTypes.number.isRequired,
  sunrise: PropTypes.number.isRequired,
};
ReactDOM.render(<WeatherContainer />, root);
