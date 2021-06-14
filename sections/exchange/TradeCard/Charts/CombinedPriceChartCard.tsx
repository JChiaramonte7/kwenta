import { FC, useState, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import LoaderIcon from 'assets/svg/app/loader.svg';
import { CurrencyKey, SYNTHS_MAP } from 'constants/currency';
import { Period, PERIOD_LABELS_MAP, PERIOD_LABELS } from 'constants/period';
import { ChartType } from 'constants/chartType';
import ChangePercent from 'components/ChangePercent';
import {
	FlexDivRowCentered,
	NoTextTransform,
	AbsoluteCenteredDiv,
	FlexDiv,
	FlexDivCol,
} from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useCombinedCandleSticksChartData from 'sections/exchange/TradeCard/Charts/hooks/useCombinedCandleSticksChartData';
import useCombinedRates from 'sections/exchange/TradeCard/Charts/hooks/useCombinedRates';
import { DesktopOnlyView, MobileOnlyView } from 'components/Media';

import {
	ChartData,
	CurrencyLabel,
	CurrencyPrice,
	Actions,
	ChartBody,
	StyledTextButton,
	OverlayMessage,
	NoData,
	PeriodSelector,
	CompareRatioToggle,
	CompareRatioToggleType,
	CompareRatioToggleContainer,
} from './common/styles';
import OverlayMessageContainer from './common/OverlayMessage';
import CurrencyPricePlaceHolder from './common/CurrencyPricePlaceHolder';
import CurrencyLabelsWithDots from './common/CurrencyLabelsWithDots';
import AreaChart from './Types/AreaChart';
import CompareChart from './Types/CompareChart';
import CandlesticksChart from './Types/CandlesticksChart';

type CombinedPriceChartCardProps = {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	basePriceRate: number | null;
	quotePriceRate: number | null;
	className?: string;
	openAfterHoursModalCallback?: () => void;
	selectedPeriod: Period;
	setSelectedPeriod: (p: Period) => void;
	selectedChartType: ChartType;
	setSelectedChartType: (c: ChartType) => void;
};

const CombinedPriceChartCard: FC<CombinedPriceChartCardProps> = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	basePriceRate,
	quotePriceRate,
	openAfterHoursModalCallback,
	selectedPeriod,
	setSelectedPeriod,
	selectedChartType,
	setSelectedChartType,
	...rest
}) => {
	const { t } = useTranslation();

	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const selectedPeriodLabel = useMemo(() => PERIOD_LABELS_MAP[selectedPeriod], [selectedPeriod]);

	const {
		data: areaChartData,
		noData: noAreaChartData,
		change,
		isLoadingRates: isLoadingAreaData,
	} = useCombinedRates({
		baseCurrencyKey,
		quoteCurrencyKey,
		selectedPeriodLabel,
	});
	const {
		noData: noCandleSticksChartData,
		isLoading: isLoadingCandleSticksChartData,
		data: candleSticksChartData,
	} = useCombinedCandleSticksChartData({ baseCurrencyKey, quoteCurrencyKey, selectedPeriodLabel });
	const {
		isMarketClosed: isBaseMarketClosed,
		marketClosureReason: baseMarketClosureReason,
	} = useMarketClosed(baseCurrencyKey);
	const {
		isMarketClosed: isQuoteMarketClosed,
		marketClosureReason: quoteMarketClosureReason,
	} = useMarketClosed(quoteCurrencyKey);

	const isMarketClosed = isBaseMarketClosed || isQuoteMarketClosed;

	const [currentPrice, setCurrentPrice] = useState<number | null>(null);
	const price = currentPrice || (basePriceRate ?? 1) / (quotePriceRate! || 1);

	const eitherCurrencyIsSUSD = useMemo(
		() => baseCurrencyKey === SYNTHS_MAP.sUSD || quoteCurrencyKey === SYNTHS_MAP.sUSD,
		[baseCurrencyKey, quoteCurrencyKey]
	);

	const showOverlayMessage = isMarketClosed;
	const showLoader = isLoadingAreaData || isLoadingCandleSticksChartData;
	const noData = noCandleSticksChartData || noAreaChartData;
	const disabledInteraction = showLoader || showOverlayMessage;

	const isCompareChart = useMemo(() => selectedChartType === ChartType.COMPARE, [
		selectedChartType,
	]);
	const isAreaChart = useMemo(() => selectedChartType === ChartType.AREA, [selectedChartType]);
	const isCandleStickChart = useMemo(() => selectedChartType === ChartType.CANDLESTICK, [
		selectedChartType,
	]);

	return (
		<Container {...rest}>
			<ChartHeader>
				<ChartHeaderInner>
					{!(baseCurrencyKey && quoteCurrencyKey) ? (
						<CurrencyPricePlaceHolder />
					) : isCompareChart ? (
						<CurrencyLabelsWithDots {...{ baseCurrencyKey, quoteCurrencyKey }} />
					) : (
						<>
							<FlexDiv>
								<DesktopOnlyView>
									<CurrencyLabel>
										<Trans
											i18nKey="common.currency.currency-price"
											values={{ currencyKey: `${baseCurrencyKey}/${quoteCurrencyKey}` }}
											components={[<NoTextTransform />]}
										/>
									</CurrencyLabel>
								</DesktopOnlyView>
								<MobileOnlyView>
									<CurrencyLabel>{`${baseCurrencyKey}/${quoteCurrencyKey}`}</CurrencyLabel>
								</MobileOnlyView>
							</FlexDiv>
							{price != null && (
								<FlexDiv>
									<CurrencyPrice>
										{formatNumber(price, {
											minDecimals: getMinNoOfDecimals(price),
										})}
									</CurrencyPrice>
								</FlexDiv>
							)}
							{change != null && <ChangePercent value={change} />}
						</>
					)}
				</ChartHeaderInner>
				{!isMarketClosed && (
					<Actions>
						{eitherCurrencyIsSUSD ? null : (
							<CompareRatioToggleContainer>
								<CompareRatioToggle>
									<CompareRatioToggleType
										onClick={() => {
											setSelectedChartType(ChartType.COMPARE);
										}}
										isActive={isCompareChart}
									>
										{t('common.chart-types.compare')}
									</CompareRatioToggleType>
									<CompareRatioToggleType
										onClick={() => {
											setSelectedChartType(ChartType.AREA);
										}}
										isActive={isAreaChart}
									>
										{t('common.chart-types.ratio')}
									</CompareRatioToggleType>
									<CompareRatioToggleType
										onClick={() => {
											setSelectedChartType(ChartType.CANDLESTICK);
										}}
										isActive={isCandleStickChart}
									>
										{t('common.chart-types.candlesticks')}
									</CompareRatioToggleType>
								</CompareRatioToggle>
							</CompareRatioToggleContainer>
						)}
						<PeriodSelector>
							{PERIOD_LABELS.map((period) => (
								<StyledTextButton
									key={period.period}
									isActive={period.period === selectedPeriod}
									onClick={(event) => {
										setSelectedPeriod(period.period);
										if (
											selectedChartType === ChartType.CANDLESTICK &&
											period.period !== Period.ONE_MONTH
										) {
											// candlesticks type is only available on monthly view
											setSelectedChartType(ChartType.AREA);
										}
									}}
								>
									{t(period.i18nLabel)}
								</StyledTextButton>
							))}
						</PeriodSelector>
					</Actions>
				)}
			</ChartHeader>
			<ChartBody>
				<ChartData disabledInteraction={disabledInteraction}>
					{isCompareChart ? (
						<CompareChart {...{ baseCurrencyKey, quoteCurrencyKey, selectedPeriodLabel }} />
					) : isCandleStickChart ? (
						<CandlesticksChart
							data={candleSticksChartData}
							{...{ selectedPeriodLabel, selectedPriceCurrency }}
						/>
					) : (
						<AreaChart
							{...{
								selectedPeriodLabel,
								change,
								setCurrentPrice,
							}}
							data={areaChartData}
							noData={noAreaChartData}
							yAxisTickFormatter={(val: number) =>
								formatNumber(val, {
									minDecimals: getMinNoOfDecimals(val),
								})
							}
							tooltipPriceFormatter={(n: number) =>
								formatNumber(n, {
									minDecimals: getMinNoOfDecimals(n),
								})
							}
							linearGradientId={`price-chart-card-area-${baseCurrencyKey}-${quoteCurrencyKey}`}
						/>
					)}
				</ChartData>

				<AbsoluteCenteredDiv>
					{showOverlayMessage ? (
						<OverlayMessage>
							{isBaseMarketClosed && isQuoteMarketClosed ? (
								<BothMarketsClosedOverlayMessageContainer>
									<BothMarketsClosedOverlayMessageItem>
										<OverlayMessageContainer
											{...{
												marketClosureReason: quoteMarketClosureReason,
												currencyKey: quoteCurrencyKey!,
												openAfterHoursModalCallback,
											}}
										/>
									</BothMarketsClosedOverlayMessageItem>
									<BothMarketsClosedOverlayMessageItem>
										<OverlayMessageContainer
											{...{
												marketClosureReason: baseMarketClosureReason,
												currencyKey: baseCurrencyKey!,
												openAfterHoursModalCallback,
											}}
										/>
									</BothMarketsClosedOverlayMessageItem>
								</BothMarketsClosedOverlayMessageContainer>
							) : isBaseMarketClosed ? (
								<OverlayMessageContainer
									{...{
										marketClosureReason: baseMarketClosureReason,
										currencyKey: baseCurrencyKey!,
										openAfterHoursModalCallback,
									}}
								/>
							) : (
								<OverlayMessageContainer
									{...{
										marketClosureReason: quoteMarketClosureReason,
										currencyKey: quoteCurrencyKey!,
										openAfterHoursModalCallback,
									}}
								/>
							)}
						</OverlayMessage>
					) : showLoader ? (
						<Svg src={LoaderIcon} />
					) : noData ? (
						<NoData>{t('exchange.price-chart-card.no-data')}</NoData>
					) : undefined}
				</AbsoluteCenteredDiv>
			</ChartBody>
		</Container>
	);
};

function getMinNoOfDecimals(value: number): number {
	let decimals = 2;
	if (value < 1) {
		const [, afterDecimal] = value.toString().split('.'); // todo
		if (afterDecimal) {
			for (let i = 0; i < afterDecimal.length; i++) {
				const n = afterDecimal[i];
				if (parseInt(n) !== 0) {
					decimals = i + 3;
					break;
				}
			}
		}
	}
	return decimals;
}

const Container = styled.div`
	position: relative;
`;

const ChartHeader = styled(FlexDivRowCentered)`
	border-bottom: 1px solid #171a1d;
	padding-bottom: 5px;
`;

const BothMarketsClosedOverlayMessageContainer = styled(FlexDiv)`
	justify-content: space-around;
	grid-gap: 3rem;
`;

const BothMarketsClosedOverlayMessageItem = styled(FlexDivCol)`
	align-items: center;
`;

const ChartHeaderInner = styled(FlexDivRowCentered)`
	grid-gap: 20px;
`;

export default CombinedPriceChartCard;
