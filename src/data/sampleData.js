// This file contains sample data for testing the F1 telemetry dashboard

export const sampleMeetings = [
    {
        meeting_key: 1229,
        circuit_key: 63,
        circuit_short_name: "Sakhir",
        circuit_name: "Bahrain International Circuit",
        meeting_code: "BRN",
        location: "Sakhir",
        country_key: 36,
        country_code: "BRN",
        country_name: "Bahrain",
        meeting_name: "Bahrain Grand Prix",
        meeting_official_name: "FORMULA 1 GULF AIR BAHRAIN GRAND PRIX 2024",
        gmt_offset: "03:00:00",
        date_start: "2024-02-29T11:30:00+00:00",
        year: 2024
    },
    {
        meeting_key: 1230,
        circuit_key: 149,
        circuit_short_name: "Jeddah",
        circuit_name: "Jeddah Corniche Circuit",
        meeting_code: "KSA",
        location: "Jeddah",
        country_key: 153,
        country_code: "KSA",
        country_name: "Saudi Arabia",
        meeting_name: "Saudi Arabian Grand Prix",
        meeting_official_name: "FORMULA 1 STC SAUDI ARABIAN GRAND PRIX 2024",
        gmt_offset: "03:00:00",
        date_start: "2024-03-07T13:30:00+00:00",
        year: 2024
    },
    {
        meeting_key: 1231,
        circuit_key: 10,
        circuit_short_name: "Melbourne",
        circuit_name: "Albert Park Circuit",
        meeting_code: "AUS",
        location: "Melbourne",
        country_key: 5,
        country_code: "AUS",
        country_name: "Australia",
        meeting_name: "Australian Grand Prix",
        meeting_official_name: "FORMULA 1 ROLEX AUSTRALIAN GRAND PRIX 2024",
        gmt_offset: "11:00:00",
        date_start: "2024-03-22T01:30:00+00:00",
        year: 2024
    },
    {
        meeting_key: 1244,
        circuit_key: 39,
        circuit_short_name: "Monza",
        circuit_name: "Autodromo Nazionale Monza",
        meeting_code: "ITA",
        location: "Monza",
        country_key: 13,
        country_code: "ITA",
        country_name: "Italy",
        meeting_name: "Italian Grand Prix",
        meeting_official_name: "FORMULA 1 PIRELLI GRAN PREMIO D'ITALIA 2024",
        gmt_offset: "02:00:00",
        date_start: "2024-08-30T11:30:00+00:00",
        year: 2024
    },
    {
        meeting_key: 1240,
        circuit_key: 2,
        circuit_short_name: "Silverstone",
        circuit_name: "Silverstone Circuit",
        meeting_code: "GBR",
        location: "Silverstone",
        country_key: 2,
        country_code: "GBR",
        country_name: "Great Britain",
        meeting_name: "British Grand Prix",
        meeting_official_name: "FORMULA 1 QATAR AIRWAYS BRITISH GRAND PRIX 2024",
        gmt_offset: "01:00:00",
        date_start: "2024-07-05T11:30:00+00:00",
        year: 2024
    }
];

export const sampleSessions = {
    "Monza": [
        {
            session_key: 4001,
            session_name: "Practice 1",
            session_official_name: "Practice 1",
            meeting_key: 1244,
            meeting_name: "Italian Grand Prix",
            location: "Monza",
            country_name: "Italy",
            circuit_key: 39,
            circuit_short_name: "Monza",
            circuit_name: "Autodromo Nazionale Monza",
            date_start: "2024-08-30T11:30:00+00:00",
            session_type: "practice",
        },
        {
            session_key: 4002,
            session_name: "Practice 2",
            session_official_name: "Practice 2",
            meeting_key: 1244,
            meeting_name: "Italian Grand Prix",
            location: "Monza",
            country_name: "Italy",
            circuit_key: 39,
            circuit_short_name: "Monza",
            circuit_name: "Autodromo Nazionale Monza",
            date_start: "2024-08-30T15:00:00+00:00",
            session_type: "practice",
        },
        {
            session_key: 4003,
            session_name: "Practice 3",
            session_official_name: "Practice 3",
            meeting_key: 1244,
            meeting_name: "Italian Grand Prix",
            location: "Monza",
            country_name: "Italy",
            circuit_key: 39,
            circuit_short_name: "Monza",
            circuit_name: "Autodromo Nazionale Monza",
            date_start: "2024-08-31T10:30:00+00:00",
            session_type: "practice",
        },
        {
            session_key: 4004,
            session_name: "Qualifying",
            session_official_name: "Qualifying",
            meeting_key: 1244,
            meeting_name: "Italian Grand Prix",
            location: "Monza",
            country_name: "Italy",
            circuit_key: 39,
            circuit_short_name: "Monza",
            circuit_name: "Autodromo Nazionale Monza",
            date_start: "2024-08-31T14:00:00+00:00",
            session_type: "qualifying",
        },
        {
            session_key: 4005,
            session_name: "Race",
            session_official_name: "Race",
            meeting_key: 1244,
            meeting_name: "Italian Grand Prix",
            location: "Monza",
            country_name: "Italy",
            circuit_key: 39,
            circuit_short_name: "Monza",
            circuit_name: "Autodromo Nazionale Monza",
            date_start: "2024-09-01T13:00:00+00:00",
            session_type: "race",
        }
    ],
    "Silverstone": [
        {
            session_key: 3001,
            session_name: "Practice 1",
            session_official_name: "Practice 1",
            meeting_key: 1240,
            meeting_name: "British Grand Prix",
            location: "Silverstone",
            country_name: "Great Britain",
            circuit_key: 2,
            circuit_short_name: "Silverstone",
            circuit_name: "Silverstone Circuit",
            date_start: "2024-07-05T11:30:00+00:00",
            session_type: "practice",
        },
        {
            session_key: 3002,
            session_name: "Practice 2",
            session_official_name: "Practice 2",
            meeting_key: 1240,
            meeting_name: "British Grand Prix",
            location: "Silverstone",
            country_name: "Great Britain",
            circuit_key: 2,
            circuit_short_name: "Silverstone",
            circuit_name: "Silverstone Circuit",
            date_start: "2024-07-05T15:00:00+00:00",
            session_type: "practice",
        },
        {
            session_key: 3003,
            session_name: "Practice 3",
            session_official_name: "Practice 3",
            meeting_key: 1240,
            meeting_name: "British Grand Prix",
            location: "Silverstone",
            country_name: "Great Britain",
            circuit_key: 2,
            circuit_short_name: "Silverstone",
            circuit_name: "Silverstone Circuit",
            date_start: "2024-07-06T10:30:00+00:00",
            session_type: "practice",
        },
        {
            session_key: 3004,
            session_name: "Qualifying",
            session_official_name: "Qualifying",
            meeting_key: 1240,
            meeting_name: "British Grand Prix",
            location: "Silverstone",
            country_name: "Great Britain",
            circuit_key: 2,
            circuit_short_name: "Silverstone",
            circuit_name: "Silverstone Circuit",
            date_start: "2024-07-06T14:00:00+00:00",
            session_type: "qualifying",
        },
        {
            session_key: 3005,
            session_name: "Race",
            session_official_name: "Race",
            meeting_key: 1240,
            meeting_name: "British Grand Prix",
            location: "Silverstone",
            country_name: "Great Britain",
            circuit_key: 2,
            circuit_short_name: "Silverstone",
            circuit_name: "Silverstone Circuit",
            date_start: "2024-07-07T14:00:00+00:00",
            session_type: "race",
        }
    ]
};

export const sampleDrivers = {
  "Monza": {
    "Practice 1": [
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ],
    "Practice 2": [
      // same drivers as Practice 1
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ],
    "Practice 3": [
      // same drivers as Practice 1
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ],
    "Qualifying": [
      // same drivers as Practice 1
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ],
    "Race": [
      // same drivers as Practice 1
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ]
  },
  "Silverstone": {
    "Practice 1": [
      // same drivers list as Monza.P 1
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ],
    "Practice 2": [
      // same drivers
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ],
    "Practice 3": [
      // same drivers
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ],
    "Qualifying": [
      // same drivers
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ],
    "Race": [
      // same drivers
      {
        driver_number: 1,
        first_name: "Max",
        last_name: "Verstappen",
        full_name: "Max Verstappen",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "NED"
      },
      {
        driver_number: 11,
        first_name: "Sergio",
        last_name: "Perez",
        full_name: "Sergio Perez",
        team_name: "Red Bull",
        team_color: "#0600EF",
        country_code: "MEX"
      },
      {
        driver_number: 44,
        first_name: "Lewis",
        last_name: "Hamilton",
        full_name: "Lewis Hamilton",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 63,
        first_name: "George",
        last_name: "Russell",
        full_name: "George Russell",
        team_name: "Mercedes",
        team_color: "#00D2BE",
        country_code: "GBR"
      },
      {
        driver_number: 16,
        first_name: "Charles",
        last_name: "Leclerc",
        full_name: "Charles Leclerc",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "MON"
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        full_name: "Carlos Sainz",
        team_name: "Ferrari",
        team_color: "#DC0000",
        country_code: "ESP"
      },
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        full_name: "Lando Norris",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "GBR"
      },
      {
        driver_number: 81,
        first_name: "Oscar",
        last_name: "Piastri",
        full_name: "Oscar Piastri",
        team_name: "McLaren",
        team_color: "#FF8700",
        country_code: "AUS"
      }
    ]
  }
};


// Generate sample lap data for all drivers
export const generateSampleLapData = (circuitName, sessionName, driverNumbers) => {
    const lapData = [];

    driverNumbers.forEach(driverNumber => {
        const totalLaps = circuitName === "Monza" ? 53 : (circuitName === "Silverstone" ? 52 : 50);

        for (let lap = 1; lap <= totalLaps; lap++) {
            // Add some randomness to make the data interesting
            const randomFactor = Math.random() * 0.5;
            const baseS1 = 28.5 + (driverNumber % 3) * 0.1;
            const baseS2 = 31.2 + (driverNumber % 3) * 0.15;
            const baseS3 = 30.8 + (driverNumber % 3) * 0.05;

            const s1Time = baseS1 + randomFactor;
            const s2Time = baseS2 + randomFactor;
            const s3Time = baseS3 + randomFactor;
            const lapTime = s1Time + s2Time + s3Time;

            lapData.push({
                lap_number: lap,
                driver_number: driverNumber,
                lap_time: lapTime,
                sector_1_time: s1Time,
                sector_2_time: s2Time,
                sector_3_time: s3Time,
                circuit_name: circuitName,
                session_name: sessionName
            });
        }
    });

    return lapData;
};

// Generate sample telemetry data for a specific lap
export const generateSampleTelemetryData = (circuitName, sessionName, driverNumber, lapNumber) => {
    const dataPoints = [];
    const baseTime = new Date().getTime();

    // Generate 20 data points per lap
    for (let i = 0; i < 20; i++) {
        const timeOffset = i * 5000; // 5 seconds between data points
        const date = new Date(baseTime + timeOffset).toISOString();

        // Add randomness and driver/lap variations
        const speed = 300 - (i % 5) * 50 + Math.random() * 30 - (driverNumber % 3) * 5;
        const throttle = i % 5 === 0 ? 30 + Math.random() * 20 : 80 + Math.random() * 20;
        const brake = i % 5 === 0 ? 70 + Math.random() * 30 : Math.random() * 10;

        dataPoints.push({
            date,
            lap_number: lapNumber,
            driver_number: driverNumber,
            speed,
            throttle,
            brake,
            n_gear: Math.min(8, Math.floor(speed / 50) + 1),
            drs: i % 7 === 0 ? 1 : 0,
            rpm: 5000 + (speed * 30),
            circuit_name: circuitName,
            session_name: sessionName
        });
    }

    return dataPoints;
};

// Generate sample pit stop data
export const generateSamplePitStops = (circuitName, sessionName, driverNumbers) => {
    const pitStops = [];

    driverNumbers.forEach(driverNumber => {
        const numberOfStops = driverNumber % 3 === 0 ? 3 : driverNumber % 2 === 0 ? 2 : 1;

        for (let i = 0; i < numberOfStops; i++) {
            const lapNumber = 15 + i * 20 + (driverNumber % 5);
            const pitDuration = 2.0 + Math.random() * 1.5;

            pitStops.push({
                driver_number: driverNumber,
                lap_number: lapNumber,
                pit_duration: pitDuration,
                circuit_name: circuitName,
                session_name: sessionName
            });
        }
    });

    return pitStops;
};

// Generate sample stint data for tire compounds
export const generateSampleStints = (circuitName, sessionName, driverNumbers) => {
    const stints = [];
    const compounds = ["soft", "medium", "hard"];

    driverNumbers.forEach(driverNumber => {
        const numberOfStops = driverNumber % 3 === 0 ? 3 : driverNumber % 2 === 0 ? 2 : 1;
        const totalLaps = circuitName === "Monza" ? 53 : (circuitName === "Silverstone" ? 52 : 50);

        let lastLap = 0;
        for (let i = 0; i <= numberOfStops; i++) {
            const startLap = i === 0 ? 1 : lastLap + 1;
            const endLap = i === numberOfStops ? totalLaps : (15 + i * 20 + (driverNumber % 5));
            lastLap = endLap;

            stints.push({
                driver_number: driverNumber,
                stint_number: i + 1,
                compound: compounds[(i + driverNumber) % compounds.length],
                start_lap: startLap,
                end_lap: endLap,
                circuit_name: circuitName,
                session_name: sessionName
            });
        }
    });

    return stints;
};