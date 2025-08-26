'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { stringify as uuidStringify, v4, parse } from 'uuid'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram, useCounterProgramAccount } from './counter-data-access'
import { bufferToUUID, ellipsify, generateUuidV4AsUint8Array, uuidToBuffer } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'

export function CounterCreate() {
  const { createEntry } = useCounterProgram()

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const { publicKey: owner } = useWallet()

  const isFormValid = title.trim() !== '' && message.trim() !== ''

  const handleSubmit = async () => {
    if (owner && isFormValid) {
      const id = uuidToBuffer(v4())
      await createEntry.mutateAsync({ id, title, message, owner })
      setTitle('')
      setMessage('')
    }
  }

  if (!owner) {
    return (
      <p>
        Connect your wallet
        <Button onClick={() => {}}>Connect</Button>
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 w-full input input-bordered border border-white rounded"
      />
      <textarea
        placeholder="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="p-2 w-full textarea textarea-bordered border border-white rounded"
      />
      <Button onClick={handleSubmit} disabled={createEntry.isPending || !isFormValid}>
        { createEntry.isPending ? 'Submitting...' : 'Submit on-chain' }
      </Button>
    </div>
  )
}

export function CounterList() {
  const { accounts, getProgramAccount } = useCounterProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6 min-w-2xl'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CounterCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CounterCard({ account }: { account: PublicKey }) {
  const { publicKey } = useWallet()
  const { accountQuery, updateEntry, deleteEntry } = useCounterProgramAccount({
    account,
  })

  const [message, setMessage] = useState('')

  const isFormValid = message.trim() !== ''

  const handleUpdatee = () => {
    if (publicKey && isFormValid && accountQuery.data) {
      const { id, title } = accountQuery.data
      updateEntry.mutateAsync({ id, title, message, owner: publicKey })
    }
  }

  return accountQuery.isLoading || !accountQuery.data ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>{ellipsify(bufferToUUID(accountQuery.data.id))}</CardTitle>
        <CardDescription>
          Account: <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </CardDescription>
        <CardAction>
          <Button
            onClick={() => {
              const id = accountQuery.data?.id
              if (!id) {
                toast.error('ID is not available')
                return
              }
              deleteEntry.mutateAsync(id)
            }}
            disabled={deleteEntry.isPending}
          >
            Delete
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p>{accountQuery.data?.title}</p>
          <p>{accountQuery.data?.message}</p>
        </div>
      </CardContent>
    </Card>
  )
}
