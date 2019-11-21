import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transfer-success',
  templateUrl: './transfer-success.component.html',
  styleUrls: ['./transfer-success.component.scss']
})
export class TransferSuccessComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute) { }

  etherscanLink = '#';

  ngOnInit() {
    const { transactionHash } = this.activatedRoute.snapshot.params;
    this.etherscanLink = `https://rinkeby.etherscan.io/tx/${transactionHash}`;
  }

}
