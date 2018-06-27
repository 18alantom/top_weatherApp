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

const unixToStandardTime = (t) => {
  const d = new Date(t * 1000);
  return `${d.getHours()}:${d.getMinutes()}`;
};

const roundToTwo = v => Math.round(v * 100) / 100;

const kelvinToCelcius = (t) => {
  let temp = t;
  temp -= 273;
  return roundToTwo(temp);
};

const tempSwitcher = (e) => {
  let temp = e.target.innerText;
  const rex = /(\d+\.\d+)(.+)/g;
  const array = rex.exec(temp);
  let t = array[1];
  const u = array[2];
  if (u === '°C') {
    t = t * (9 / 5) + 32;
    temp = `${roundToTwo(t)}°F`;
  }
  if (u === '°F') {
    t = (t - 32) * (5 / 9);
    temp = `${roundToTwo(t)}°C`;
  }
  e.target.innerText = `${temp}`;
  // e.target.innerText = `Temperature: ${temp}`;
};

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
    this.getWeather(null, null);
  }

  setWeather(w) {
    let { cod } = w;
    cod = Number(cod);
    if (cod === 200) {
      this.setState({ weatherData: w, statusMessage: 'The current weather conditions are ' });
    } else if (w.message) {
      this.setState({ statusMessage: w.message });
    }
  }

  getWeather(longitude, latitude) {
    let API_CALL;
    const { zip, country } = this.state;
    if (longitude && latitude) {
      API_CALL = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&lat=${longitude}&lon=${latitude}`;
    } else {
      API_CALL = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&zip=${zip},${country}`;
    }
    fetch(API_CALL, { method: 'get', mode: 'cors' })
      .then(w => w.json())
      .then(this.setWeather)
      .catch(e => console.error(e));
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
        showMore={this.showMore}
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
      const temp = main.temp ? `${kelvinToCelcius(main.temp)}°C` : 'n/a';
      const { pressure, humidity } = main;
      const { main: wMain, description } = weather[0];
      const { sunrise, sunset, country } = sys;
      const location = area === '' ? 'n/a' : `${area}, ${country}`;
      return (
        <ShowData
          location={location}
          temp={temp}
          pressure={String(pressure || 'n/a')}
          humidity={String(humidity || 'n/a')}
          wMain={wMain || 'n/a'}
          description={description || 'n/a'}
          sunrise={sunrise ? unixToStandardTime(sunrise) : ''}
          sunset={sunset ? unixToStandardTime(sunset) : ''}
        />
      );
    }
    return '';
  }
  return (
    <div className="outerDiv">
      <h1 id="theTitle">
Weather
      </h1>
      <div className="inputDiv">
        <input type="number" id="zipCode" onChange={onChange} placeholder="Zip code" />
        <input type="text" id="countryCode" onChange={onChange} placeholder="Country code" />
        <button onClick={onClick} type="button">
          Submit
        </button>
      </div>
      <h4>
        <br />
        {statusMessage}
      </h4>
      {renderData()}
    </div>
  );
}

function ShowData(props) {
  const {
    location, temp, pressure, humidity, description, sunrise, sunset,
  } = props;
  return (
    <div className="showDivOuter">
      <div className="showDiv">
        <p>
          {location}
        </p>
        <p id="desc">
          {description}
        </p>
        <button onClick={tempSwitcher} type="button">
          {`${temp}`}
        </button>
        <p>
          <span>
            Pressure
            {'  '}
          </span>
          {`${pressure}hPa`}
        </p>
        <p>
          <span>
            Humidity
            {'  '}
          </span>
          {`${humidity}%`}
        </p>
        <p>
          <span>
            Sunrise
            {'  '}
          </span>
          {sunrise ? `${sunrise}` : 'n/a'}
        </p>
        <p>
          <span>
            Sunset
            {'  '}
          </span>
          {sunset ? `${sunset}` : 'n/a'}
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
  temp: PropTypes.string.isRequired,
  pressure: PropTypes.string.isRequired,
  humidity: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  sunset: PropTypes.string.isRequired,
  sunrise: PropTypes.string.isRequired,
};
ReactDOM.render(<WeatherContainer />, root);
