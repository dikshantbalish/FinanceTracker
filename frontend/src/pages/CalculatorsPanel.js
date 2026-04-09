import React, { useState } from 'react';
import { formatCurrency } from '../utils';

const roundNumber = (value) => Math.round(Number(value || 0));

const calculateEmi = (principal, annualRate, months) => {
    if (!principal || !months) return 0;
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) {
        return principal / months;
    }
    const growth = Math.pow(1 + monthlyRate, months);
    return (principal * monthlyRate * growth) / (growth - 1);
};

const calculateSipFutureValue = (monthlyInvestment, annualRate, years) => {
    if (!monthlyInvestment || !years) return 0;
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;
    return monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
};

const calculateFdFutureValue = (principal, annualRate, years) => {
    if (!principal || !years) return 0;
    return principal * Math.pow(1 + annualRate / 100, years);
};

function CalculatorsPanel({ monthlyExpense }) {
    const [calculatorData, setCalculatorData] = useState({
        emiPrincipal: 500000,
        emiRate: 10,
        emiMonths: 48,
        sipMonthly: 5000,
        sipRate: 12,
        sipYears: 10,
        fdPrincipal: 100000,
        fdRate: 7,
        fdYears: 3,
        retirementYears: 25,
        retirementInflation: 6
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCalculatorData((prev) => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    const emiValue = calculateEmi(
        calculatorData.emiPrincipal,
        calculatorData.emiRate,
        calculatorData.emiMonths
    );

    const sipValue = calculateSipFutureValue(
        calculatorData.sipMonthly,
        calculatorData.sipRate,
        calculatorData.sipYears
    );

    const fdValue = calculateFdFutureValue(
        calculatorData.fdPrincipal,
        calculatorData.fdRate,
        calculatorData.fdYears
    );

    const inflationAdjustedExpense = monthlyExpense * Math.pow(
        1 + (calculatorData.retirementInflation / 100),
        calculatorData.retirementYears
    );
    const retirementCorpus = inflationAdjustedExpense * 12 * 20;

    return (
        <div className='container panel-card calculator-surface' data-reveal='up' style={{ '--delay': '160ms' }}>
            <div className='card-top'>
                <div>
                    <span className='section-tag'>Calculators</span>
                    <h2 className='panel-title'>Plan decisions with numbers</h2>
                </div>
                <p className='panel-copy'>Quick scenarios for loans, SIPs, deposits, and retirement readiness.</p>
            </div>

            <div className='calculators-showcase'>
                <div className='calculator-block' data-reveal='up' style={{ '--delay': '40ms' }}>
                    <h2>EMI Calculator</h2>
                    <div className='calculator-grid'>
                        <input name='emiPrincipal' type='number' value={calculatorData.emiPrincipal} onChange={handleChange} placeholder='Principal' />
                        <input name='emiRate' type='number' value={calculatorData.emiRate} onChange={handleChange} placeholder='Rate %' />
                        <input name='emiMonths' type='number' value={calculatorData.emiMonths} onChange={handleChange} placeholder='Months' />
                    </div>
                    <p className='helper-text'>Estimated EMI: {formatCurrency(roundNumber(emiValue))}</p>
                </div>

                <div className='calculator-block' data-reveal='up' style={{ '--delay': '100ms' }}>
                    <h2>SIP Calculator</h2>
                    <div className='calculator-grid'>
                        <input name='sipMonthly' type='number' value={calculatorData.sipMonthly} onChange={handleChange} placeholder='Monthly SIP' />
                        <input name='sipRate' type='number' value={calculatorData.sipRate} onChange={handleChange} placeholder='Return %' />
                        <input name='sipYears' type='number' value={calculatorData.sipYears} onChange={handleChange} placeholder='Years' />
                    </div>
                    <p className='helper-text'>Projected SIP value: {formatCurrency(roundNumber(sipValue))}</p>
                </div>

                <div className='calculator-block' data-reveal='up' style={{ '--delay': '160ms' }}>
                    <h2>FD Calculator</h2>
                    <div className='calculator-grid'>
                        <input name='fdPrincipal' type='number' value={calculatorData.fdPrincipal} onChange={handleChange} placeholder='Deposit' />
                        <input name='fdRate' type='number' value={calculatorData.fdRate} onChange={handleChange} placeholder='Rate %' />
                        <input name='fdYears' type='number' value={calculatorData.fdYears} onChange={handleChange} placeholder='Years' />
                    </div>
                    <p className='helper-text'>Projected FD value: {formatCurrency(roundNumber(fdValue))}</p>
                </div>

                <div className='calculator-block' data-reveal='up' style={{ '--delay': '220ms' }}>
                    <h2>Retirement Calculator</h2>
                    <div className='calculator-grid retirement-grid'>
                        <input name='retirementYears' type='number' value={calculatorData.retirementYears} onChange={handleChange} placeholder='Years left' />
                        <input name='retirementInflation' type='number' value={calculatorData.retirementInflation} onChange={handleChange} placeholder='Inflation %' />
                    </div>
                    <p className='helper-text'>Estimated retirement corpus: {formatCurrency(roundNumber(retirementCorpus))}</p>
                </div>
            </div>
        </div>
    );
}

export default CalculatorsPanel;
