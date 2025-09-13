import React from 'react'
import FormsPage from '../page'

export default function FormEditRoute({ params }: { params: { formId: string } }) {
  const { formId } = params
  return <FormsPage initialEditId={formId} />
}
