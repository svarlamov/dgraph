/*
 * Copyright (C) 2017 Dgraph Labs, Inc. and Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package uid

import (
	"github.com/dgraph-io/dgraph/x"
)

var lmgr *leaseManager

type leaseManager struct {
	x.SafeMutex
	maxLeasedId uint64

	// access to nextId is serialized
	nextId uint64
}

func (l *leaseManager) NumAvailable() uint64 {
	l.RLock()
	defer l.RUnlock()
	return l.maxLeasedId - l.nextId
}

// AssignNew assigns N unique uids sequentially
// and returns the starting number of the sequence
func (l *leaseManager) AssignNew(N uint64) uint64 {
	x.AssertTrue(LeaseManager().NumAvailable() >= N)
	id := l.nextId
	l.nextId += N
	return id
}

func (l *leaseManager) AcquireLeaseTill(id uint64) {
	l.Lock()
	defer l.Unlock()
	l.maxLeasedId = id
}

func (l *leaseManager) MaxLeasedId() uint64 {
	l.RLock()
	defer l.RUnlock()
	return l.maxLeasedId
}

func LeaseManager() *leaseManager {
	return lmgr
}

// package level init
func init() {
	lmgr = new(leaseManager)
}
