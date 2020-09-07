{
    /***************/
    /* Misc. Utils */
    /***************/

    const isUndefined = value => value === void(0);
    const roundDecimals = (float, numberOfDecimalPlaces) => Math.round(float * 10**numberOfDecimalPlaces) / 10**numberOfDecimalPlaces;
    const numberToMoneyString = number => (Math.sign(number) === -1 ? '-' : '') + '$' + Math.abs(roundDecimals(number, 2)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const floatToPercentString = number => (number*100).toFixed(2) + '%';
    const dateFromString = string => new Date(Date.parse(string));
    Array.prototype.mean = function() {
	return this.reduce((a, b) => a + b, 0) / this.length;
    };
    
    /**********************/
    /* HTML Element Utils */
    /**********************/
    
    const createNewElement = (childTag, {classes, attributes, innerHTML}={}) => {
        const newElement = document.createElement(childTag);
        if (!isUndefined(classes)) {
            classes.forEach(childClass => newElement.classList.add(childClass));
        }
        if (!isUndefined(attributes)) {
            Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
                newElement.setAttribute(attributeName, attributeValue);
            });
        }
        if (!isUndefined(innerHTML)) {
            newElement.innerHTML = innerHTML;
        }
        return newElement;
    };

    const createTableWithElements = (rows, {classes, attributes}={}) => {
        const table = createNewElement('table', {classes, attributes});
        rows.forEach(elements => {
            const tr = document.createElement('tr');
            table.append(tr);
            elements.forEach(element => {
                const td = document.createElement('td');
                tr.append(td);
                td.append(element);
            });
        });
        return table;
    };

    const createContainer = (elements, {classes, attributes}={}) => {
        const container = createNewElement('div', {classes, attributes});
        elements.forEach(element => {
            container.append(element);
        });
        return container;
    };
    
    const createExpandable = (buttonElement, contentElement, {classes, attributes}={}) => {
        const container = createNewElement('div', {classes, attributes});
        container.append(buttonElement);
        buttonElement.classList.add('expandable-button');
        container.append(contentElement);
        contentElement.classList.add('expandable-content');
        buttonElement.onclick = (event) => {
            buttonElement.classList.toggle('active');
            contentElement.classList.toggle('active');
            if (contentElement.classList.contains('active')) {
                contentElement.style.maxHeight = contentElement.scrollHeight * 1.25 + 'px'; // @todo mulltiplication is a work around
            } else {
                contentElement.style.maxHeight = null;
            }
        };
        return container;
    };

    /****************/
    /* Display Data */
    /****************/

    const generateDateContainer = (dateData) => {
        const dateContainer = createNewElement('div', {classes: ['stats-and-chart-container']});
        const iframe = createNewElement('iframe', {
            classes: ['chart-iframe'],
            attributes: {
                src: dateData.html_file,
                sandbox: 'allow-same-origin allow-scripts',
                scrolling: 'no',
      	        seamless: 'seamless',
      	        frameborder: '0'
            }
        });
        const openingPriceLabel = createNewElement('p', {innerHTML: 'Opening Price: '});
        const openingPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.opening_price)});
        const closingPriceLabel = createNewElement('p', {innerHTML: 'Closing Price: '});
        const closingPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.closing_price)});
        const minPriceLabel = createNewElement('p', {innerHTML: 'Min Price: '});
        const minPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.min_price)});
        const maxPriceLabel = createNewElement('p', {innerHTML: 'Max Price: '});
        const maxPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.max_price)});
        const maxIncreaseFromOpeningPriceLabel = createNewElement('p', {innerHTML: 'Biggest Jump'});
        const maxIncreaseFromOpeningPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.max_price-dateData.opening_price)});
        const maxDecreaseFromOpeningPriceLabel = createNewElement('p', {innerHTML: 'Biggest Dip'});
        const maxDecreaseFromOpeningPriceValueElement = createNewElement('p', {innerHTML: numberToMoneyString(dateData.min_price-dateData.opening_price)});
        const maxIncreaseFromOpeningPricePercentLabel = createNewElement('p', {innerHTML: 'Biggest Jump %'});
        const maxIncreaseFromOpeningPricePercentValueElement = createNewElement('p', {innerHTML: floatToPercentString((dateData.max_price-dateData.opening_price)/dateData.opening_price)});
        const maxDecreaseFromOpeningPricePercentLabel = createNewElement('p', {innerHTML: 'Biggest Dip %'});
        const maxDecreaseFromOpeningPricePercentValueElement = createNewElement('p', {innerHTML: floatToPercentString((dateData.min_price-dateData.opening_price)/dateData.opening_price)});
        const statsTable = createTableWithElements([
            [openingPriceLabel, openingPriceValueElement],
            [closingPriceLabel, closingPriceValueElement],
            [minPriceLabel, minPriceValueElement],
            [maxPriceLabel, maxPriceValueElement],
            [maxIncreaseFromOpeningPriceLabel, maxIncreaseFromOpeningPriceValueElement],
            [maxDecreaseFromOpeningPriceLabel, maxDecreaseFromOpeningPriceValueElement],
            [maxIncreaseFromOpeningPricePercentLabel, maxIncreaseFromOpeningPricePercentValueElement],
            [maxDecreaseFromOpeningPricePercentLabel, maxDecreaseFromOpeningPricePercentValueElement],
        ], {classes: ['stats-table']});
        const statsAndChartTable = createTableWithElements([[statsTable, iframe]], {classes: ['stats-and-chart-table']});
        dateContainer.append(statsAndChartTable);
        return dateContainer;
    };

    const generateCombinedDatesContainer = (tickerSymbolData) => {
        const container = createNewElement('div', {classes: ['stats-and-chart-container']});
        const iframe = createNewElement('iframe', {
            classes: ['chart-iframe'],
            attributes: {
                src: tickerSymbolData.combined_date_html_file,
                sandbox: 'allow-same-origin allow-scripts',
                scrolling: 'no',
      	        seamless: 'seamless',
      	        frameborder: '0'
            }
        });
        const meanOpeningPriceLabel = createNewElement('p', {innerHTML: 'Mean Opening Price: '});
        const meanOpeningPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.opening_price).mean())});
        const meanClosingPriceLabel = createNewElement('p', {innerHTML: 'Mean Closing Price: '});
        const meanClosingPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.closing_price).mean())});
        const meanMinPriceLabel = createNewElement('p', {innerHTML: 'Mean Min Price: '});
        const meanMinPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.min_price).mean())});
        const meanMaxPriceLabel = createNewElement('p', {innerHTML: 'Mean Max Price: '});
        const meanMaxPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.max_price).mean())});
        const meanMaxIncreaseFromOpeningPriceLabel = createNewElement('p', {innerHTML: 'Mean Biggest Jump'});
        const meanMaxIncreaseFromOpeningPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(
            Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.max_price-data_for_date.opening_price).mean()
        )});
        const meanMaxDecreaseFromOpeningPriceLabel = createNewElement('p', {innerHTML: 'Mean Biggest Dip'});
        const meanMaxDecreaseFromOpeningPriceValue = createNewElement('p', {innerHTML: numberToMoneyString(
            Object.values(tickerSymbolData.date_data).map(data_for_date => data_for_date.min_price-data_for_date.opening_price).mean()
        )});
        const meanMaxIncreaseFromOpeningPricePercentLabel = createNewElement('p', {innerHTML: 'Mean Biggest Jump %'});
        const meanMaxIncreaseFromOpeningPricePercentValue = createNewElement('p', {innerHTML: floatToPercentString(
            Object.values(tickerSymbolData.date_data).map(data_for_date => (data_for_date.max_price-data_for_date.opening_price)/data_for_date.opening_price).mean()
        )});
        const meanMaxDecreaseFromOpeningPricePercentLabel = createNewElement('p', {innerHTML: 'Mean Biggest Dip %'});
        const meanMaxDecreaseFromOpeningPricePercentValue = createNewElement('p', {innerHTML: floatToPercentString(
            Object.values(tickerSymbolData.date_data).map(data_for_date => (data_for_date.min_price-data_for_date.opening_price)/data_for_date.opening_price).mean()
        )});
        const statsTable = createTableWithElements([
            [meanOpeningPriceLabel, meanOpeningPriceValue],
            [meanClosingPriceLabel, meanClosingPriceValue],
            [meanMinPriceLabel, meanMinPriceValue],
            [meanMaxPriceLabel, meanMaxPriceValue],
            [meanMaxIncreaseFromOpeningPriceLabel, meanMaxIncreaseFromOpeningPriceValue],
            [meanMaxDecreaseFromOpeningPriceLabel, meanMaxDecreaseFromOpeningPriceValue],
            [meanMaxIncreaseFromOpeningPricePercentLabel, meanMaxIncreaseFromOpeningPricePercentValue],
            [meanMaxDecreaseFromOpeningPricePercentLabel, meanMaxDecreaseFromOpeningPricePercentValue],
        ], {classes: ['stats-table']});
        const statsAndChartTable = createTableWithElements([[statsTable, iframe]], {classes: ['stats-and-chart-table']});
        container.append(statsAndChartTable);
        return container;
    };

    const generateTickerSymbolExpandable = ([tickerSymbol, tickerSymbolData]) => {
        const tickerSymbolLabel = createNewElement('p', {classes: ['ticker-symbol-label'], innerHTML: tickerSymbol});

        const dateContainers = Object.entries(tickerSymbolData.date_data)
              .sort(([dateStringA, dateDataA],[dateStringB, dateDataB]) => dateFromString(dateStringB) - dateFromString(dateStringA))
              .map(item => item[1])
              .map(generateDateContainer);
        const allDatesContainer = createContainer(dateContainers, {classes: ['all-dates-container']});
        const combinedDatesContainer = generateCombinedDatesContainer(tickerSymbolData);
        
        const tickerSymbolContent = createTableWithElements([[combinedDatesContainer, allDatesContainer]], {classes: ['ticker-symbol-content']});
        
        const tickerSymbolExpandable = createExpandable(tickerSymbolLabel, tickerSymbolContent, {classes: ['ticker-symbol-expandable']});
        return tickerSymbolExpandable;
    };
    
    fetch('./output/output_summary.json')
        .then(response => response.json())
        .then(outputSummary => {
            const tickerSymbolExpandables = Object.entries(outputSummary).map(generateTickerSymbolExpandable);
            const allTickerSymbolDataContainer = createContainer(tickerSymbolExpandables, {attributes: {id: 'all-ticker-symbol-data-container'}});
            const body = document.querySelector('body').append(allTickerSymbolDataContainer);
        });
}
