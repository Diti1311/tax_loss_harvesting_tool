import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon } from
'lucide-react';
import {
  fetchHoldings,
  fetchCapitalGains,
  Holding,
  CapitalGains } from
'../services/api';
import '../styles/TaxHarvesting.css';
type SortConfig = {
  key: keyof Holding | 'totalCurrentValue';
  direction: 'asc' | 'desc';
} | null;
export const TaxHarvesting: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [capitalGains, setCapitalGains] = useState<CapitalGains | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [selectedCoins, setSelectedCoins] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [holdingsData, gainsData] = await Promise.all([
        fetchHoldings(),
        fetchCapitalGains()]
        );
        setHoldings(holdingsData);
        setCapitalGains(gainsData);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };
  const formatCrypto = (value: number, symbol: string) => {
    return `${Number(value.toFixed(5))} ${symbol}`;
  };
  const handleSort = (key: keyof Holding | 'totalCurrentValue') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
    sortConfig &&
    sortConfig.key === key &&
    sortConfig.direction === 'asc')
    {
      direction = 'desc';
    }
    setSortConfig({
      key,
      direction
    });
  };
  const sortedHoldings = useMemo(() => {
    let sortableItems = [...holdings];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        if (sortConfig.key === 'totalCurrentValue') {
          aValue = a.totalHolding * a.currentPrice;
          bValue = b.totalHolding * b.currentPrice;
        } else if (sortConfig.key === 'stcg') {
          aValue = a.stcg.gain;
          bValue = b.stcg.gain;
        } else if (sortConfig.key === 'ltcg') {
          aValue = a.ltcg.gain;
          bValue = b.ltcg.gain;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [holdings, sortConfig]);
  const displayedHoldings = showAll ?
  sortedHoldings :
  sortedHoldings.slice(0, 4);
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCoins(new Set(displayedHoldings.map((h) => h.coin)));
    } else {
      setSelectedCoins(new Set());
    }
  };
  const handleSelectCoin = (coin: string) => {
    const newSelected = new Set(selectedCoins);
    if (newSelected.has(coin)) {
      newSelected.delete(coin);
    } else {
      newSelected.add(coin);
    }
    setSelectedCoins(newSelected);
  };
  if (loading) return <div className="th-loading">Loading your tax data...</div>;
  if (error) return <div className="th-error">{error}</div>;
  if (!capitalGains) return null;
  // Pre-Harvesting Calculations
  const preStcgNet = capitalGains.stcg.profits - capitalGains.stcg.losses;
  const preLtcgNet = capitalGains.ltcg.profits - capitalGains.ltcg.losses;
  const preRealised = preStcgNet + preLtcgNet;
  // Post-Harvesting Calculations
  let postStcgProfits = capitalGains.stcg.profits;
  let postStcgLosses = capitalGains.stcg.losses;
  let postLtcgProfits = capitalGains.ltcg.profits;
  let postLtcgLosses = capitalGains.ltcg.losses;
  selectedCoins.forEach((coinId) => {
    const coin = holdings.find((c) => c.coin === coinId);
    if (coin) {
      if (coin.stcg.gain > 0) postStcgProfits += coin.stcg.gain;else
      postStcgLosses += Math.abs(coin.stcg.gain);
      if (coin.ltcg.gain > 0) postLtcgProfits += coin.ltcg.gain;else
      postLtcgLosses += Math.abs(coin.ltcg.gain);
    }
  });
  const postStcgNet = postStcgProfits - postStcgLosses;
  const postLtcgNet = postLtcgProfits - postLtcgLosses;
  const postEffective = postStcgNet + postLtcgNet;
  const taxSaved = preRealised - postEffective;
  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ArrowUpDown className="th-sort-icon" />;
    return sortConfig.direction === 'asc' ?
    <ArrowUp className="th-sort-icon" /> :

    <ArrowDown className="th-sort-icon" />;

  };
  return (
    <div className={`th-container ${theme === 'light' ? 'light' : ''}`}>
      <div className="th-header">
        <h1 className="th-title">Tax Harvesting</h1>
        <span
          className="th-link-wrap"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}>
          
          <a className="th-link">How it works?</a>
          {showTooltip &&
          <div className="th-tooltip">
              Lorem ipsum dolor sit amet consectetur. Euismod id posuere nibh
              semper mattis scelerisque tellus. Vel mattis diam duis morbi
              tellus dui consectetur.
              <a className="th-tooltip-know"> Know More</a>
            </div>
          }
        </span>
        <button
          className="th-theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme">
          
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="th-notes-panel">
        <div
          className="th-notes-header"
          onClick={() => setIsNotesExpanded(!isNotesExpanded)}>
          
          <div className="th-notes-title-wrap">
            <Info className="th-notes-icon" size={18} />
            Important Notes & Disclaimers
          </div>
          <ChevronDown
            className={`th-notes-chevron ${isNotesExpanded ? 'expanded' : ''}`}
            size={20} />
          
        </div>
        {isNotesExpanded &&
        <div className="th-notes-content">
            <ul>
              <li>
                Tax-loss harvesting is currently not allowed under Indian tax
                regulations. Please consult your tax advisor before making any
                decisions.
              </li>
              <li>
                Tax harvesting does not apply to derivatives or futures. These
                are handled separately as business income under tax rules.
              </li>
              <li>
                Price and market value data is fetched from Coingecko, not from
                individual exchanges. As a result, values may slightly differ
                from the ones on your exchange.
              </li>
              <li>
                Some countries do not have a short-term / long-term bifurcation.
                For now, we are calculating everything as long-term.
              </li>
              <li>
                Only realized losses are considered for harvesting. Unrealized
                losses in held assets are not counted.
              </li>
            </ul>
          </div>
        }
      </div>

      <div className="th-cards-grid">
        {/* Pre Harvesting Card */}
        <div className="th-card th-card-default">
          <h2 className="th-card-title">Pre Harvesting</h2>
          <table className="th-card-table">
            <thead>
              <tr>
                <th></th>
                <th>Short-term</th>
                <th>Long-term</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Profits</td>
                <td>{formatCurrency(capitalGains.stcg.profits)}</td>
                <td>{formatCurrency(capitalGains.ltcg.profits)}</td>
              </tr>
              <tr>
                <td>Losses</td>
                <td>- {formatCurrency(capitalGains.stcg.losses)}</td>
                <td>- {formatCurrency(capitalGains.ltcg.losses)}</td>
              </tr>
              <tr>
                <td>Net Capital Gains</td>
                <td>{formatCurrency(preStcgNet)}</td>
                <td>{formatCurrency(preLtcgNet)}</td>
              </tr>
            </tbody>
          </table>
          <div className="th-card-divider"></div>
          <div className="th-card-footer">
            <span className="th-card-footer-label">
              Realised Capital Gains:
            </span>
            <span className="th-card-footer-value">
              {formatCurrency(preRealised)}
            </span>
          </div>
        </div>

        {/* After Harvesting Card */}
        <div className="th-card th-card-blue">
          <h2 className="th-card-title">After Harvesting</h2>
          <table className="th-card-table">
            <thead>
              <tr>
                <th></th>
                <th>Short-term</th>
                <th>Long-term</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Profits</td>
                <td>{formatCurrency(postStcgProfits)}</td>
                <td>{formatCurrency(postLtcgProfits)}</td>
              </tr>
              <tr>
                <td>Losses</td>
                <td>- {formatCurrency(postStcgLosses)}</td>
                <td>- {formatCurrency(postLtcgLosses)}</td>
              </tr>
              <tr>
                <td>Net Capital Gains</td>
                <td>{formatCurrency(postStcgNet)}</td>
                <td>{formatCurrency(postLtcgNet)}</td>
              </tr>
            </tbody>
          </table>
          <div className="th-card-divider"></div>
          <div className="th-card-footer">
            <span className="th-card-footer-label">
              Effective Capital Gains:
            </span>
            <span className="th-card-footer-value">
              {formatCurrency(postEffective)}
            </span>
          </div>
          {taxSaved > 0 &&
          <div className="th-save-message">
              🎉 You are going to save upto {formatCurrency(taxSaved)}
            </div>
          }
        </div>
      </div>

      <div className="th-holdings-section">
        <h2 className="th-holdings-title">Holdings</h2>
        <div className="th-table-wrapper">
          <table className="th-table">
            <thead>
              <tr>
                <th
                  style={{
                    width: '40px'
                  }}>
                  
                  <input
                    type="checkbox"
                    className="th-checkbox"
                    checked={
                    displayedHoldings.length > 0 &&
                    selectedCoins.size === displayedHoldings.length
                    }
                    onChange={handleSelectAll} />
                  
                </th>
                <th onClick={() => handleSort('coinName')}>
                  Asset {renderSortIcon('coinName')}
                </th>
                <th onClick={() => handleSort('totalHolding')}>
                  Holdings
                  <br />
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 'normal'
                    }}>
                    
                    Current Market Rate
                  </span>{' '}
                  {renderSortIcon('totalHolding')}
                </th>
                <th onClick={() => handleSort('totalCurrentValue')}>
                  Total Current Value {renderSortIcon('totalCurrentValue')}
                </th>
                <th onClick={() => handleSort('stcg')}>
                  Short-term {renderSortIcon('stcg')}
                </th>
                <th onClick={() => handleSort('ltcg')}>
                  Long-Term {renderSortIcon('ltcg')}
                </th>
                <th>Amount to Sell</th>
              </tr>
            </thead>
            <tbody>
              {displayedHoldings.map((coin) => {
                const isSelected = selectedCoins.has(coin.coin);
                const totalValue = coin.totalHolding * coin.currentPrice;
                return (
                  <tr key={coin.coin} className={isSelected ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="th-checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectCoin(coin.coin)} />
                      
                    </td>
                    <td>
                      <div className="th-asset-cell">
                        <img
                          src={coin.logo}
                          alt={coin.coinName}
                          className="th-asset-logo" />
                        
                        <div className="th-asset-info">
                          <span className="th-asset-name">{coin.coinName}</span>
                          <span className="th-asset-symbol">{coin.coin}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="th-cell-stack">
                        <span>
                          {formatCrypto(coin.totalHolding, coin.coin)}
                        </span>
                        <span className="th-cell-sub">
                          {formatCurrency(coin.currentPrice)}/{coin.coin}
                        </span>
                      </div>
                    </td>
                    <td>{formatCurrency(totalValue)}</td>
                    <td>
                      <div className="th-cell-stack">
                        <span
                          className={
                          coin.stcg.gain >= 0 ?
                          'th-text-green' :
                          'th-text-red'
                          }>
                          
                          {coin.stcg.gain >= 0 ? '+' : ''}
                          {formatCurrency(coin.stcg.gain)}
                        </span>
                        <span className="th-cell-sub">
                          {formatCrypto(coin.stcg.balance, coin.coin)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="th-cell-stack">
                        <span
                          className={
                          coin.ltcg.gain >= 0 ?
                          'th-text-green' :
                          'th-text-red'
                          }>
                          
                          {coin.ltcg.gain >= 0 ? '+' : ''}
                          {formatCurrency(coin.ltcg.gain)}
                        </span>
                        <span className="th-cell-sub">
                          {formatCrypto(coin.ltcg.balance, coin.coin)}
                        </span>
                      </div>
                    </td>
                    <td>
                      {isSelected ?
                      formatCrypto(coin.totalHolding, coin.coin) :
                      '-'}
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
        {holdings.length > 4 &&
        <button className="th-view-all" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'View less' : 'View all'}
          </button>
        }
      </div>
    </div>);

};