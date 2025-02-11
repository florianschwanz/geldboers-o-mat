import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * Represents an income group
 */
export type IncomeGroup = {
  /** Index */
  index: number;
  /** Texts for annual income  */
  annually: { selectText: string; buttonToggleText: string };
  /** Texts for monthly income  */
  monthly: { selectText: string; buttonToggleText: string };
};

/**
 * Bullet point
 */
export type BulletPoint = {
  /** Text */
  text: string;
  /** Sub-texts */
  subTexts?: BulletPoint[];
};

/**
 * Represents a political party
 */
export type Party = {
  /** Name */
  name: string;
  /** Image path */
  image: string;
  /** Color */
  color: string;
  /** Relative changes in income based on income groups */
  changesIncomeRelative: number[];
  /** Absolute changes in income based on income groups */
  changesIncomeAbsoluteAnnually: number[];
  /** Absolute changes for single household */
  changesIncomeSingle: number[];
  /** Absolute changes for single-parent household with one child  */
  changesIncomeSingleParentWithOneChild: number[];
  /** Absolute changes for single-parent household with two children */
  changesIncomeSingleParentWithTwoChildren: number[];
  /** Absolute changes for single-earner household without children */
  changesIncomeSingleEarnerCoupleWithoutChildren: number[];
  /** Absolute changes for single-earner household with two children  */
  changesIncomeSingleEarnerCoupleWithTwoChildren: number[];
  /** Change in overall federal budget */
  changeFederalBudget: number;

  /** Reform proposals */
  reformProposals: BulletPoint[];
};

/**
 * Handles data loading
 */
@Injectable({
  providedIn: 'root',
})
export class DataService {
  //
  // Injections
  //

  /** HTTP client */
  private http = inject(HttpClient);

  //
  // Subjects
  //

  /** Subject providing income groups */
  incomeGroupsSubject = new BehaviorSubject<IncomeGroup[]>([]);
  /** Subject providing income groups for example household */
  incomeGroupsExampleHouseholdSubject = new BehaviorSubject<IncomeGroup[]>([]);
  /** Subject providing parties */
  partiesSubject = new BehaviorSubject<Party[]>([]);

  //
  //
  //

  /**
   * Loads income group data
   * @private
   */
  loadIncomeGroupData() {
    this.http.get('assets/data/income-groups.json').subscribe((res) => {
      this.incomeGroupsSubject.next(res as IncomeGroup[]);
    });
  }
  /**
   * Loads income group data for example households
   * @private
   */
  loadIncomeGroupExampleHouseholdsData() {
    this.http
      .get('assets/data/income-groups-example-households.json')
      .subscribe((res) => {
        this.incomeGroupsExampleHouseholdSubject.next(res as IncomeGroup[]);
      });
  }

  /**
   * Loads party data
   * @private
   */
  loadPartyData() {
    this.http.get('assets/data/parties.json').subscribe((res) => {
      this.partiesSubject.next(res as Party[]);
    });
  }
}
