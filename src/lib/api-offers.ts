export const ACTIVE_OFFER_SQL = `
  o.status = 'active'
  and coalesce(nullif(o.data->>'startDate', '')::date, date '0001-01-01') <= current_date
  and coalesce(nullif(o.data->>'endDate', '')::date, date '9999-12-31') >= current_date
`;
