import React, { useState, useEffect } from 'react';
import { useQuery, ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com/graphql',
  cache: new InMemoryCache(),
});

interface Country {
  code: string;
  name: string;
  native: string;
  capital: string;
  emoji: string;
  currency: string;
  languages: {
    code: string;
    name: string;
  }[];
}

const COUNTRIES_QUERY = gql`
  {
    countries {
      name
      native
      capital
      emoji
      currency
      languages {
        code
        name
      }
    }
  }
`;

const COUNTRY_QUERY = gql`
  query Query($code: String!) {
    country(code: $code) {
      name
      native
      capital
      emoji
      currency
      languages {
        code
        name
      }
    }
  }
`;



const CountryList: React.FC = () => {
  const { loading, error, data } = useQuery(COUNTRIES_QUERY);
  const [filter, setFilter] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  useEffect(() => {
    if (!loading && data && data.countries.length > 0) {
      const index = Math.min(9, data.countries.length - 1);
      handleCountrySelect(data.countries[index].code);
    }
  }, [data, loading]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleCountrySelect = async (code: string) => {
    try {
      const { data } = await client.query({
        query: COUNTRY_QUERY,
        variables: { code },
      });
      setSelectedCountry(data.country);
    } catch (error) {
      console.error("Error fetching country data:", error);
    }
  };

  const selectBackgroundColor = (country: Country) => {
    return selectedCountry && selectedCountry.code === country.code
      ? 'lightblue'
      : 'white';
  };

  const filteredCountries = data?.countries?.filter((country: Country) =>
  country.name.toLowerCase().includes(filter.toLowerCase())
) || [];





  return (
    <div>
      <input
        type="text"
        placeholder="Ülkeleri filtrele"
        value={filter}
        onChange={handleFilterChange}
      />
      <ul>
        {filteredCountries.map((country: Country) => (
          <li
            key={country.code}
            onClick={() => handleCountrySelect(country.code)}
            style={{
              backgroundColor: selectBackgroundColor(country),
            }}
          >
            {country.name}
          </li>
        ))}
      </ul>
      {selectedCountry && (
        <div>
          <h2>{selectedCountry.name}</h2>
          <p>Ülke Kodu: {selectedCountry.code}</p>
          <p>Doğal Adı: {selectedCountry.native}</p>
          <p>Başkent: {selectedCountry.capital}</p>
          <p>Emoji: {selectedCountry.emoji}</p>
          <p>Para Birimi: {selectedCountry.currency}</p>
          <p>Diller:</p>
          <ul>
            {selectedCountry.languages.map((language) => (
              <li key={language.code}>{language.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CountryList;
