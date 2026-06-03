import { PASSENGER_FIELD_LABELS } from '../../utils/passengerImport/passengerFields'
import { getProfilePreviewFields } from '../../utils/passengerImport/importProfiles'

function ImportPreviewTable({ rows, onChange, onRemove, profileId }) {
  const previewFields = getProfilePreviewFields(profileId)

  return (
    <div className="crm-import-preview">
      <div className="crm-table-wrap crm-table-wrap--import-scroll">
        <table className="crm-table crm-table--import-preview">
          <thead>
            <tr>
              <th className="crm-table__num">#</th>
              <th className="crm-table--import-sticky" aria-label="Include" />
              {previewFields.map((field) => (
                <th key={field}>{PASSENGER_FIELD_LABELS[field]}</th>
              ))}
              <th>Warnings</th>
              <th className="crm-table--import-sticky-right" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row._id} className={row._warnings?.length ? 'crm-import-preview__row--warn' : ''}>
                <td className="crm-table__num">{index + 1}</td>
                <td className="crm-table--import-sticky">
                  <input
                    type="checkbox"
                    checked={row._selected !== false}
                    onChange={(e) => onChange(row._id, { _selected: e.target.checked })}
                    aria-label="Include passenger"
                  />
                </td>
                {previewFields.map((field) => (
                  <td key={field}>
                    <input
                      className="crm-import-preview__input"
                      value={row[field] || ''}
                      onChange={(e) => onChange(row._id, { [field]: e.target.value })}
                      placeholder={PASSENGER_FIELD_LABELS[field]}
                    />
                  </td>
                ))}
                <td className="crm-import-preview__warnings">
                  {(row._warnings || []).map((warning) => (
                    <span key={warning} className="crm-import-preview__warning-tag">
                      {warning}
                    </span>
                  ))}
                </td>
                <td className="crm-table--import-sticky-right">
                  <button type="button" className="crm-link-btn crm-link-btn--danger" onClick={() => onRemove(row._id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ImportPreviewTable
